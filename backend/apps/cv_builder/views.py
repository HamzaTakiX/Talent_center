"""CV Builder API views.

Views are intentionally thin — they parse inputs with serializers and
delegate to services. Every write is wrapped by ``transaction.atomic``
inside its service.
"""

from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404, HttpResponse
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts_et_roles.models import StudentProfile

from .models import CvTemplate
from .permissions import (
    IsAssetOwner,
    IsSectionOwner,
    IsShareLinkOwner,
    IsStudentCvOwner,
    IsVersionOwner,
)
from .selectors import (
    get_active_share_link_by_token,
    get_asset_for_user,
    get_section_for_user,
    get_share_link_for_user,
    get_student_cv_for_user,
    get_template,
    get_version_for_user,
    list_active_templates,
    list_analyses_for_cv,
    list_share_links_for_cv,
    list_student_cvs_for_user,
    list_versions_for_cv,
)
from .serializers import (
    CreateShareLinkSerializer,
    CvAiAnalysisSerializer,
    CvAssetSerializer,
    CvSectionCreateSerializer,
    CvSectionSerializer,
    CvSectionUpdateSerializer,
    CvShareLinkSerializer,
    CvTemplateSerializer,
    CvVersionListSerializer,
    CvVersionSerializer,
    PublicCvSerializer,
    ReorderSectionsSerializer,
    SaveVersionSerializer,
    StudentCvCreateSerializer,
    StudentCvDetailSerializer,
    StudentCvListSerializer,
    StudentCvUpdateSerializer,
    SwitchTemplateSerializer,
    UpdateShareLinkSerializer,
)
from .services import (
    analysis_service,
    cv_service,
    export_service,
    section_service,
    share_service,
    version_service,
)


# ---- Envelope helper ---------------------------------------------------------

def envelope(success: bool, message: str = '', data=None, errors=None):
    """Standard API response envelope (matches accounts_et_roles convention)."""
    response = {'success': success, 'message': message}
    if data is not None:
        response['data'] = data
    if errors is not None:
        response['errors'] = errors
    return response


def _dj_validation_to_response(exc: DjangoValidationError) -> Response:
    errors = exc.message_dict if hasattr(exc, 'message_dict') else {'detail': exc.messages}
    return Response(
        envelope(success=False, message='Validation failed.', errors=errors),
        status=status.HTTP_400_BAD_REQUEST,
    )


def _student_profile_or_403(request):
    try:
        return request.user.student_profile
    except StudentProfile.DoesNotExist:
        return None


# =============================================================================
# Templates
# =============================================================================

class CvTemplateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        templates = list_active_templates()
        data = CvTemplateSerializer(templates, many=True).data
        return Response(envelope(True, 'ok', data=data))


class CvTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        tpl = get_template(pk)
        return Response(envelope(True, 'ok', data=CvTemplateSerializer(tpl).data))


# =============================================================================
# Student CVs
# =============================================================================

class StudentCvListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = list_student_cvs_for_user(request.user)
        return Response(envelope(True, 'ok', data=StudentCvListSerializer(qs, many=True).data))

    def post(self, request):
        profile = _student_profile_or_403(request)
        if profile is None:
            return Response(
                envelope(False, 'Only students can create a CV.', errors={'role': ['Student profile required.']}),
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = StudentCvCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        template = None
        if payload.get('template_id'):
            template = CvTemplate.objects.filter(pk=payload['template_id'], is_active=True).first()
            if template is None:
                raise ValidationError({'template_id': 'Template not found or inactive.'})

        try:
            cv = cv_service.create_student_cv(
                profile,
                title=payload.get('title') or None,
                template=template,
            )
        except DjangoValidationError as e:
            return _dj_validation_to_response(e)

        return Response(
            envelope(True, 'CV created.', data=StudentCvDetailSerializer(cv).data),
            status=status.HTTP_201_CREATED,
        )


class StudentCvDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def get(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        return Response(envelope(True, 'ok', data=StudentCvDetailSerializer(cv).data))

    def patch(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        serializer = StudentCvUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        cv = cv_service.update_student_cv(cv, **serializer.validated_data)
        return Response(envelope(True, 'CV updated.', data=StudentCvDetailSerializer(cv).data))

    def delete(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        try:
            cv_service.delete_student_cv(cv)
        except DjangoValidationError as e:
            return _dj_validation_to_response(e)
        return Response(envelope(True, 'CV deleted.'), status=status.HTTP_204_NO_CONTENT)


class CvMakePrimaryView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def post(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        cv = cv_service.make_primary(cv)
        return Response(envelope(True, 'CV set as primary.', data=StudentCvListSerializer(cv).data))


class CvSwitchTemplateView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def post(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        serializer = SwitchTemplateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_template = CvTemplate.objects.filter(
            pk=serializer.validated_data['template_id'], is_active=True,
        ).first()
        if new_template is None:
            raise ValidationError({'template_id': 'Template not found or inactive.'})
        try:
            cv = cv_service.switch_template(cv, new_template)
        except DjangoValidationError as e:
            return _dj_validation_to_response(e)
        return Response(envelope(True, 'Template switched.', data=StudentCvDetailSerializer(cv).data))


# =============================================================================
# Sections
# =============================================================================

class CvSectionCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def post(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        serializer = CvSectionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            section = section_service.add_section(cv, **serializer.validated_data)
        except DjangoValidationError as e:
            return _dj_validation_to_response(e)
        return Response(
            envelope(True, 'Section added.', data=CvSectionSerializer(section).data),
            status=status.HTTP_201_CREATED,
        )


class CvSectionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSectionOwner]

    def patch(self, request, pk):
        section = get_section_for_user(request.user, pk)
        serializer = CvSectionUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        section = section_service.update_section(section, **serializer.validated_data)
        return Response(envelope(True, 'Section updated.', data=CvSectionSerializer(section).data))

    def delete(self, request, pk):
        section = get_section_for_user(request.user, pk)
        section_service.delete_section(section)
        return Response(envelope(True, 'Section deleted.'), status=status.HTTP_204_NO_CONTENT)


class CvReorderSectionsView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def post(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        serializer = ReorderSectionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            sections = section_service.reorder_sections(cv, serializer.validated_data['order'])
        except DjangoValidationError as e:
            return _dj_validation_to_response(e)
        return Response(
            envelope(True, 'Sections reordered.',
                     data=CvSectionSerializer(sections, many=True).data)
        )


# =============================================================================
# Assets
# =============================================================================

class CvAssetUploadView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        serializer = CvAssetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        asset = serializer.save(student_cv=cv)
        return Response(
            envelope(True, 'Asset uploaded.', data=CvAssetSerializer(asset).data),
            status=status.HTTP_201_CREATED,
        )


class CvAssetDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAssetOwner]

    def delete(self, request, pk):
        asset = get_asset_for_user(request.user, pk)
        asset.file.delete(save=False)
        asset.delete()
        return Response(envelope(True, 'Asset deleted.'), status=status.HTTP_204_NO_CONTENT)


# =============================================================================
# Versions
# =============================================================================

class CvVersionListView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def get(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        versions = list_versions_for_cv(cv)
        return Response(
            envelope(True, 'ok', data=CvVersionListSerializer(versions, many=True).data)
        )


class CvSaveVersionView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def post(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        serializer = SaveVersionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        version = version_service.snapshot(
            cv, note=serializer.validated_data.get('change_note', ''), user=request.user,
        )
        return Response(
            envelope(True, 'Version saved.', data=CvVersionSerializer(version).data),
            status=status.HTTP_201_CREATED,
        )


class CvRestoreVersionView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner, IsVersionOwner]

    def post(self, request, cv_id, version_id):
        cv = get_student_cv_for_user(request.user, cv_id)
        version = get_version_for_user(request.user, version_id)
        if version.student_cv_id != cv.pk:
            raise ValidationError({'version_id': 'Version does not belong to this CV.'})
        cv = version_service.restore(cv, version, user=request.user)
        return Response(
            envelope(True, f'Restored to version {version.version_number}.',
                     data=StudentCvDetailSerializer(cv).data)
        )


# =============================================================================
# AI analysis
# =============================================================================

class CvAnalyzeView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def post(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        analysis = analysis_service.analyze(cv)
        return Response(
            envelope(True, 'Analysis complete.',
                     data=CvAiAnalysisSerializer(analysis).data),
            status=status.HTTP_201_CREATED,
        )


class CvAnalysisHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def get(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        analyses = list_analyses_for_cv(cv)
        return Response(
            envelope(True, 'ok', data=CvAiAnalysisSerializer(analyses, many=True).data)
        )


# =============================================================================
# Export
# =============================================================================

class CvExportPdfView(APIView):
    """Two modes:
    - default / ``mode=client``: returns the structured payload and records
      ``last_exported_at``. The React editor renders to PDF in the browser.
    - ``mode=server``: returns binary PDF bytes rendered by WeasyPrint."""
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def post(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        mode = (request.data.get('mode') or request.query_params.get('mode') or 'client').lower()

        if mode == 'server':
            try:
                pdf_bytes = export_service.render_pdf_bytes(cv)
            except RuntimeError as e:
                return Response(
                    envelope(False, str(e), errors={'renderer': [str(e)]}),
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            export_service.mark_exported(cv)
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            filename = f'{cv.slug or cv.uuid.hex[:8]}.pdf'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response

        payload = export_service.build_export_payload(cv)
        export_service.mark_exported(cv)
        return Response(envelope(True, 'Export payload ready.', data=payload))


# =============================================================================
# Share links
# =============================================================================

class CvShareLinkListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsStudentCvOwner]

    def get(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        links = list_share_links_for_cv(cv)
        return Response(envelope(True, 'ok',
                                 data=CvShareLinkSerializer(links, many=True).data))

    def post(self, request, pk):
        cv = get_student_cv_for_user(request.user, pk)
        serializer = CreateShareLinkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        link = share_service.create_share_link(
            cv,
            label=serializer.validated_data.get('label', '') or '',
            expires_at=serializer.validated_data.get('expires_at'),
            user=request.user,
        )
        return Response(
            envelope(True, 'Share link created.', data=CvShareLinkSerializer(link).data),
            status=status.HTTP_201_CREATED,
        )


class CvShareLinkDetailView(APIView):
    permission_classes = [IsAuthenticated, IsShareLinkOwner]

    def patch(self, request, pk):
        link = get_share_link_for_user(request.user, pk)
        serializer = UpdateShareLinkSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        link = share_service.update_share_link(link, **serializer.validated_data)
        return Response(envelope(True, 'Share link updated.',
                                 data=CvShareLinkSerializer(link).data))

    def delete(self, request, pk):
        link = get_share_link_for_user(request.user, pk)
        link.delete()
        return Response(envelope(True, 'Share link deleted.'),
                        status=status.HTTP_204_NO_CONTENT)


class PublicCvView(APIView):
    """Unauthenticated read-only access to a shared CV by token."""
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def get(self, request, token):
        link = get_active_share_link_by_token(token)
        if link is None:
            raise Http404('Share link not found or expired.')
        share_service.record_view(link)
        data = PublicCvSerializer(link.student_cv).data
        return Response(envelope(True, 'ok', data=data))
