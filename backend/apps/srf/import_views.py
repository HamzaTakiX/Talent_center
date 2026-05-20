"""SRF Financial Import Center — REST API."""

from __future__ import annotations

from django.core.files.base import ContentFile
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.admin_management.services.scopes import is_super_admin
from apps.admin_management.services.admins import get_admin_effective_permissions
from apps.authentication.utils import envelope

from apps.srf.import_models import (
    FinancialImportAuditEvent,
    FinancialImportBatch,
    FinancialImportMappingProfile,
)
from apps.srf.import_serializers import (
    FinancialImportAuditEventSerializer,
    FinancialImportBatchSerializer,
    FinancialImportMappingProfileSerializer,
)
from apps.srf.services.financial_import.audit import get_client_meta, log_import_event
from apps.srf.services.financial_import.column_mapping import (
    get_target_fields_schema,
    suggest_column_mapping,
)
from apps.srf.services.financial_import.file_parser import parse_financial_file
from apps.srf.services.financial_import.file_security import detect_file_format, validate_upload
from apps.srf.services.financial_import.history_cleanup import (
    clear_import_history,
    delete_import_batch,
)
from apps.srf.services.srf_data_reset import WIPE_CONFIRM_PHRASE, wipe_all_srf_financial_data
from apps.srf.services.financial_import.rollback import rollback_import_batch
from apps.srf.services.financial_import.runner import enqueue_import_batch
from apps.srf.services.financial_import.validation import run_validation_pipeline


def _has_any_permission(user, codes: tuple[str, ...]) -> bool:
    if user.is_superuser or is_super_admin(user):
        return True
    perms = get_admin_effective_permissions(user)
    return any(c in perms for c in codes)


class SrfImportPermission(EffectiveHasPermission):
    """srf.import or legacy finance.manage."""

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if _has_any_permission(request.user, ('srf.import', 'finance.manage', 'srf.financial.manage')):
            return True
        view.required_permission = 'srf.import'
        return super().has_permission(request, view)


class SrfFinancialAuditPermission(EffectiveHasPermission):
    """Audit trail access."""

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if _has_any_permission(
            request.user,
            ('srf.financial.audit', 'srf.financial.manage', 'finance.manage', 'srf.import'),
        ):
            return True
        view.required_permission = 'srf.financial.audit'
        return super().has_permission(request, view)


class SrfImportSchemaView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfImportPermission]

    def get(self, request):
        return Response(
            envelope(True, 'OK', data={
                'target_fields': get_target_fields_schema(),
                'import_modes': [
                    {'value': c.value, 'label': c.label}
                    for c in FinancialImportBatch.ImportMode
                ],
                'supported_formats': ['csv', 'xlsx', 'json'],
            }),
        )


class SrfImportUploadView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfImportPermission]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload = request.FILES.get('file')
        if upload is None:
            return Response(
                envelope(False, 'Aucun fichier. Utilisez le champ "file".'),
                status=status.HTTP_400_BAD_REQUEST,
            )

        content = upload.read()
        filename = upload.name or 'import.csv'
        meta = get_client_meta(request)

        try:
            security = validate_upload(
                content=content,
                filename=filename,
                content_type=getattr(upload, 'content_type', ''),
            )
            parsed = parse_financial_file(content=content, filename=filename)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=status.HTTP_400_BAD_REQUEST)

        academic_year = request.data.get('academic_year', '').strip()
        import_mode = request.data.get('import_mode', FinancialImportBatch.ImportMode.MERGE)
        if import_mode not in FinancialImportBatch.ImportMode.values:
            import_mode = FinancialImportBatch.ImportMode.MERGE

        suggested = suggest_column_mapping(parsed['headers'])

        batch = FinancialImportBatch.objects.create(
            status=FinancialImportBatch.Status.PREVIEW_READY,
            import_mode=import_mode,
            file_format=detect_file_format(filename),
            source_filename=filename[:255],
            file_size_bytes=security['size_bytes'],
            file_checksum_sha256=security['checksum_sha256'],
            academic_year=academic_year,
            total_rows=parsed['row_count'],
            column_mapping_json=suggested,
            preview_json={
                'headers': parsed['headers'],
                'sample_rows': parsed['rows'][:10],
            },
            started_by=request.user,
            started_at=timezone.now(),
            client_ip=meta.get('ip_address'),
            user_agent=meta.get('user_agent', ''),
            session_key=meta.get('session_key', ''),
        )
        batch.stored_file.save(filename, ContentFile(content), save=True)

        request.session[f'srf_import_rows_{batch.uuid}'] = parsed['rows']

        log_import_event(
            batch,
            FinancialImportAuditEvent.Action.UPLOAD,
            actor=request.user,
            ip_address=meta.get('ip_address'),
            user_agent=meta.get('user_agent', ''),
            message=f'Fichier téléversé : {filename}',
            payload={'row_count': parsed['row_count'], 'checksum': security['checksum_sha256']},
        )

        return Response(
            envelope(True, 'Fichier analysé', data={
                'batch': FinancialImportBatchSerializer(batch).data,
                'headers': parsed['headers'],
                'suggested_mapping': suggested,
                'row_count': parsed['row_count'],
                'sample_rows': parsed['rows'][:5],
            }),
            status=status.HTTP_201_CREATED,
        )


class SrfImportPreviewView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfImportPermission]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def post(self, request, batch_uuid):
        try:
            batch = FinancialImportBatch.objects.get(uuid=batch_uuid)
        except FinancialImportBatch.DoesNotExist:
            return Response(envelope(False, 'Lot introuvable.'), status=status.HTTP_404_NOT_FOUND)

        mapping = request.data.get('column_mapping') or batch.column_mapping_json
        import_mode = request.data.get('import_mode') or batch.import_mode
        academic_year = request.data.get('academic_year', batch.academic_year)

        if import_mode in FinancialImportBatch.ImportMode.values:
            batch.import_mode = import_mode
        batch.column_mapping_json = mapping
        batch.academic_year = academic_year

        rows = request.session.get(f'srf_import_rows_{batch.uuid}')
        if not rows and batch.stored_file:
            content = batch.stored_file.read()
            parsed = parse_financial_file(content=content, filename=batch.source_filename)
            rows = parsed['rows']

        if not rows:
            return Response(
                envelope(False, 'Données expirées. Re-téléversez le fichier.'),
                status=status.HTTP_400_BAD_REQUEST,
            )

        validation = run_validation_pipeline(batch, rows, mapping)
        batch.validation_json = validation
        batch.valid_rows = validation['summary']['valid_rows']
        batch.error_rows = validation['summary']['error_rows']
        batch.warning_rows = validation['summary']['warning_rows']
        batch.preview_json = {
            **batch.preview_json,
            'summary': validation['summary'],
            'preview_sample': validation['preview_sample'],
        }
        batch.status = FinancialImportBatch.Status.PREVIEW_READY
        batch.save()

        meta = get_client_meta(request)
        log_import_event(
            batch,
            FinancialImportAuditEvent.Action.PREVIEW,
            actor=request.user,
            ip_address=meta.get('ip_address'),
            message='Aperçu et validation générés',
            payload=validation['summary'],
        )

        return Response(envelope(True, 'Aperçu prêt', data={
            'batch': FinancialImportBatchSerializer(batch).data,
            'validation': validation,
        }))


class SrfImportExecuteView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfImportPermission]
    parser_classes = [JSONParser]

    def post(self, request, batch_uuid):
        try:
            batch = FinancialImportBatch.objects.get(uuid=batch_uuid)
        except FinancialImportBatch.DoesNotExist:
            return Response(envelope(False, 'Lot introuvable.'), status=status.HTTP_404_NOT_FOUND)

        validation = batch.validation_json or {}
        summary = validation.get('summary') or {}
        if not summary.get('can_execute'):
            return Response(
                envelope(
                    False,
                    'Aucune ligne valide à importer. Vérifiez la correspondance des colonnes et les identifiants étudiants.',
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        if batch.status == FinancialImportBatch.Status.PROCESSING:
            return Response(
                envelope(False, 'Import déjà en cours.'),
                status=status.HTTP_409_CONFLICT,
            )

        batch.status = FinancialImportBatch.Status.QUEUED
        batch.progress_percent = 0
        batch.started_at = timezone.now()
        batch.save(update_fields=['status', 'progress_percent', 'started_at', 'updated_at'])

        meta = get_client_meta(request)
        log_import_event(
            batch,
            FinancialImportAuditEvent.Action.EXECUTE,
            actor=request.user,
            ip_address=meta.get('ip_address'),
            message='Import mis en file d\'attente',
        )

        enqueue_import_batch(batch.pk)

        return Response(
            envelope(True, 'Import démarré', data=FinancialImportBatchSerializer(batch).data),
            status=status.HTTP_202_ACCEPTED,
        )


def _parse_bool_flag(request, name: str) -> bool:
    raw = request.query_params.get(name) or request.data.get(name)
    if isinstance(raw, bool):
        return raw
    return str(raw or '').lower() in ('1', 'true', 'yes', 'on')


def _parse_force_flag(request) -> bool:
    return _parse_bool_flag(request, 'force')


def _clear_batch_session(request, batch: FinancialImportBatch) -> None:
    key = f'srf_import_rows_{batch.uuid}'
    if key in request.session:
        del request.session[key]


class SrfImportBatchDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfImportPermission]

    def get(self, request, batch_uuid):
        try:
            batch = FinancialImportBatch.objects.get(uuid=batch_uuid)
        except FinancialImportBatch.DoesNotExist:
            return Response(envelope(False, 'Lot introuvable.'), status=status.HTTP_404_NOT_FOUND)
        return Response(
            envelope(True, 'OK', data=FinancialImportBatchSerializer(batch).data),
        )

    def delete(self, request, batch_uuid):
        try:
            batch = FinancialImportBatch.objects.get(uuid=batch_uuid)
        except FinancialImportBatch.DoesNotExist:
            return Response(envelope(False, 'Lot introuvable.'), status=status.HTTP_404_NOT_FOUND)

        force = _parse_force_flag(request)
        purge_financial = _parse_bool_flag(request, 'purge_financial')
        try:
            _clear_batch_session(request, batch)
            delete_import_batch(batch, force=force, purge_financial=purge_financial)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=status.HTTP_400_BAD_REQUEST)

        msg = 'Import supprimé et données SRF annulées.' if purge_financial else 'Entrée supprimée de l\'historique'
        return Response(envelope(True, msg))


class SrfImportBatchListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfImportPermission]

    def get(self, request):
        qs = FinancialImportBatch.objects.all()[:100]
        return Response(
            envelope(True, 'OK', data=FinancialImportBatchSerializer(qs, many=True).data),
        )

    def delete(self, request):
        force = _parse_force_flag(request)
        purge_financial = _parse_bool_flag(request, 'purge_financial')
        result = clear_import_history(force=force, purge_financial=purge_financial)
        message = f'{result["deleted"]} entrée(s) supprimée(s)'
        if purge_financial:
            message += ' — effets financiers annulés lorsque possible'
        if result['skipped']:
            message += f', {result["skipped"]} ignorée(s) (import en cours ou non confirmé)'
        return Response(envelope(True, message, data=result))


class SrfImportWipeFinancialModuleView(APIView):
    """Reset all SRF financial data and import history (destructive)."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfImportPermission]

    def post(self, request):
        phrase = str(
            request.data.get('confirm_phrase')
            or request.query_params.get('confirm_phrase')
            or '',
        ).strip()
        if phrase != WIPE_CONFIRM_PHRASE:
            return Response(
                envelope(
                    False,
                    f'Confirmation requise : saisissez exactement « {WIPE_CONFIRM_PHRASE} ».',
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        counts = wipe_all_srf_financial_data()
        return Response(
            envelope(
                True,
                'Module SRF réinitialisé : tous les comptes financiers supprimés, historique d\'import vidé.',
                data=counts,
            ),
        )


class SrfImportRollbackView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfImportPermission]

    def post(self, request, batch_uuid):
        try:
            batch = FinancialImportBatch.objects.get(uuid=batch_uuid)
        except FinancialImportBatch.DoesNotExist:
            return Response(envelope(False, 'Lot introuvable.'), status=status.HTTP_404_NOT_FOUND)

        force_retry = _parse_force_flag(request)
        meta = get_client_meta(request)
        try:
            result = rollback_import_batch(
                batch,
                actor=request.user,
                ip_address=meta.get('ip_address'),
                force_retry=force_retry,
            )
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=status.HTTP_400_BAD_REQUEST)

        message = 'Rollback effectué'
        if force_retry:
            message = f'Rollback relancé — {result.get("restored_accounts", 0)} compte(s) restauré(s)'
        return Response(envelope(True, message, data=result))


class SrfImportAuditListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancialAuditPermission]

    def get(self, request, batch_uuid):
        try:
            batch = FinancialImportBatch.objects.get(uuid=batch_uuid)
        except FinancialImportBatch.DoesNotExist:
            return Response(envelope(False, 'Lot introuvable.'), status=status.HTTP_404_NOT_FOUND)
        events = batch.audit_events.all()
        return Response(
            envelope(True, 'OK', data=FinancialImportAuditEventSerializer(events, many=True).data),
        )


class SrfImportMappingProfileListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfImportPermission]
    parser_classes = [JSONParser]

    def get(self, request):
        profiles = FinancialImportMappingProfile.objects.all()
        return Response(
            envelope(True, 'OK', data=FinancialImportMappingProfileSerializer(profiles, many=True).data),
        )

    def post(self, request):
        ser = FinancialImportMappingProfileSerializer(data=request.data)
        if not ser.is_valid():
            return Response(envelope(False, 'Données invalides', data=ser.errors), status=400)
        profile = ser.save(created_by=request.user)
        return Response(
            envelope(True, 'Profil créé', data=FinancialImportMappingProfileSerializer(profile).data),
            status=status.HTTP_201_CREATED,
        )
