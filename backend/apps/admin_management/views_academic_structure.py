"""REST API for Academic Structure Management (Super Admin only)."""

from __future__ import annotations

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope

from .models import WorkMode
from .permissions import IsPlatformAdminOrStudentCatalogRead, IsSuperAdmin
from .services.academic_structure_management import (
    _management_class_qs,
    _management_filiere_qs,
    _management_internship_qs,
    _management_level_qs,
    _management_work_mode_qs,
    archive_class_group,
    archive_filiere,
    archive_internship_type,
    archive_level,
    archive_work_mode,
    compute_entity_impact,
    create_class_group,
    create_filiere,
    create_internship_type,
    create_level,
    create_work_mode,
    delete_class_group,
    delete_filiere,
    delete_internship_type,
    delete_level,
    delete_work_mode,
    list_audit_log,
    reorder_filieres,
    seed_default_work_modes,
    serialize_management_class,
    serialize_management_filiere,
    serialize_management_internship,
    serialize_management_level,
    serialize_work_mode_ref,
    update_class_group,
    update_filiere,
    update_internship_type,
    update_level,
    update_work_mode,
)
from .services.i18n_labels import request_lang


def _lang(request) -> str:
    return request_lang(request)


def _handle_permanent_delete(request, delete_fn, **entity_kwargs):
    lang = _lang(request)
    try:
        delete_fn(actor=request.user, lang=lang, **entity_kwargs)
    except ValidationError as exc:
        detail = exc.detail
        message = detail.get('detail', detail) if isinstance(detail, dict) else str(detail)
        if isinstance(message, list):
            message = message[0] if message else 'Unable to delete this entity.'
        return Response(envelope(False, str(message), errors=detail), status=status.HTTP_400_BAD_REQUEST)
    return Response(envelope(True, 'Deleted'))


class AcademicStructureAuditLogView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        limit = min(int(request.query_params.get('limit', 50)), 200)
        return Response(envelope(True, 'OK', data=list_audit_log(limit=limit)))


class AcademicStructureImpactView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, entity_type: str, entity_id: int):
        impact = compute_entity_impact(entity_type.upper(), entity_id)
        return Response(envelope(True, 'OK', data=impact))


class AcademicTrackListCreateView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        include_archived = request.query_params.get('include_archived', '').lower() in ('1', 'true')
        lang = _lang(request)
        qs = _management_filiere_qs(include_archived=include_archived)
        search = request.query_params.get('search', '').strip().lower()
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        return Response(
            envelope(True, 'OK', data=[serialize_management_filiere(f, lang) for f in qs]),
        )

    def post(self, request):
        lang = _lang(request)
        data = create_filiere(actor=request.user, data=request.data, lang=lang)
        return Response(envelope(True, 'Created', data=data), status=status.HTTP_201_CREATED)


class AcademicTrackDetailView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, track_id: int):
        lang = _lang(request)
        data = update_filiere(actor=request.user, filiere_id=track_id, data=request.data, lang=lang)
        return Response(envelope(True, 'Updated', data=data))

    def delete(self, request, track_id: int):
        lang = _lang(request)
        result = archive_filiere(actor=request.user, filiere_id=track_id, lang=lang)
        return Response(envelope(True, 'Archived', data=result))


class AcademicTrackPermanentDeleteView(APIView):
    permission_classes = [IsSuperAdmin]

    def delete(self, request, track_id: int):
        return _handle_permanent_delete(request, delete_filiere, filiere_id=track_id)


class AcademicTrackReorderView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        ordered_ids = request.data.get('ordered_ids') or []
        reorder_filieres(actor=request.user, ordered_ids=[int(x) for x in ordered_ids])
        return Response(envelope(True, 'Reordered'))


class AcademicLevelManagementListCreateView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        include_archived = request.query_params.get('include_archived', '').lower() in ('1', 'true')
        filiere_id = request.query_params.get('filiere_id')
        lang = _lang(request)
        qs = _management_level_qs(
            include_archived=include_archived,
            filiere_id=int(filiere_id) if filiere_id and str(filiere_id).isdigit() else None,
        )
        return Response(
            envelope(True, 'OK', data=[serialize_management_level(l, lang) for l in qs]),
        )

    def post(self, request):
        lang = _lang(request)
        data = create_level(actor=request.user, data=request.data, lang=lang)
        return Response(envelope(True, 'Created', data=data), status=status.HTTP_201_CREATED)


class AcademicLevelManagementDetailView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, level_id: int):
        lang = _lang(request)
        data = update_level(actor=request.user, level_id=level_id, data=request.data, lang=lang)
        return Response(envelope(True, 'Updated', data=data))

    def delete(self, request, level_id: int):
        lang = _lang(request)
        result = archive_level(actor=request.user, level_id=level_id, lang=lang)
        return Response(envelope(True, 'Archived', data=result))


class AcademicLevelPermanentDeleteView(APIView):
    permission_classes = [IsSuperAdmin]

    def delete(self, request, level_id: int):
        return _handle_permanent_delete(request, delete_level, level_id=level_id)


class ClassGroupManagementListCreateView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        include_archived = request.query_params.get('include_archived', '').lower() in ('1', 'true')
        lang = _lang(request)
        qs = _management_class_qs(include_archived=include_archived)
        filiere_id = request.query_params.get('filiere_id')
        if filiere_id and str(filiere_id).isdigit():
            qs = qs.filter(filiere_id=int(filiere_id))
        return Response(
            envelope(True, 'OK', data=[serialize_management_class(c, lang) for c in qs]),
        )

    def post(self, request):
        lang = _lang(request)
        data = create_class_group(actor=request.user, data=request.data, lang=lang)
        return Response(envelope(True, 'Created', data=data), status=status.HTTP_201_CREATED)


class ClassGroupManagementDetailView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, class_id: int):
        lang = _lang(request)
        data = update_class_group(actor=request.user, class_id=class_id, data=request.data, lang=lang)
        return Response(envelope(True, 'Updated', data=data))

    def delete(self, request, class_id: int):
        lang = _lang(request)
        result = archive_class_group(actor=request.user, class_id=class_id, lang=lang)
        return Response(envelope(True, 'Archived', data=result))


class ClassGroupPermanentDeleteView(APIView):
    permission_classes = [IsSuperAdmin]

    def delete(self, request, class_id: int):
        return _handle_permanent_delete(request, delete_class_group, class_id=class_id)


class InternshipFrameworkListCreateView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        include_archived = request.query_params.get('include_archived', '').lower() in ('1', 'true')
        lang = _lang(request)
        qs = _management_internship_qs(include_archived=include_archived)
        filiere_id = request.query_params.get('filiere_id')
        level_id = request.query_params.get('level_id')
        if filiere_id and str(filiere_id).isdigit():
            qs = qs.filter(academic_level__filiere_id=int(filiere_id))
        if level_id and str(level_id).isdigit():
            qs = qs.filter(academic_level_id=int(level_id))
        return Response(
            envelope(True, 'OK', data=[serialize_management_internship(i, lang) for i in qs]),
        )

    def post(self, request):
        lang = _lang(request)
        data = create_internship_type(actor=request.user, data=request.data, lang=lang)
        return Response(envelope(True, 'Created', data=data), status=status.HTTP_201_CREATED)


class InternshipFrameworkDetailView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, type_id: int):
        lang = _lang(request)
        data = update_internship_type(actor=request.user, type_id=type_id, data=request.data, lang=lang)
        return Response(envelope(True, 'Updated', data=data))

    def delete(self, request, type_id: int):
        lang = _lang(request)
        result = archive_internship_type(actor=request.user, type_id=type_id, lang=lang)
        return Response(envelope(True, 'Archived', data=result))


class InternshipFrameworkPermanentDeleteView(APIView):
    permission_classes = [IsSuperAdmin]

    def delete(self, request, type_id: int):
        return _handle_permanent_delete(request, delete_internship_type, type_id=type_id)


class WorkModeListCreateView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        if not WorkMode.objects.exists():
            seed_default_work_modes()
        include_archived = request.query_params.get('include_archived', '').lower() in ('1', 'true')
        lang = _lang(request)
        qs = _management_work_mode_qs(include_archived=include_archived)
        return Response(
            envelope(True, 'OK', data=[serialize_work_mode_ref(w, lang) for w in qs]),
        )

    def post(self, request):
        lang = _lang(request)
        data = create_work_mode(actor=request.user, data=request.data, lang=lang)
        return Response(envelope(True, 'Created', data=data), status=status.HTTP_201_CREATED)


class WorkModeDetailView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, mode_id: int):
        lang = _lang(request)
        data = update_work_mode(actor=request.user, mode_id=mode_id, data=request.data, lang=lang)
        return Response(envelope(True, 'Updated', data=data))

    def delete(self, request, mode_id: int):
        lang = _lang(request)
        result = archive_work_mode(actor=request.user, mode_id=mode_id, lang=lang)
        return Response(envelope(True, 'Archived', data=result))


class WorkModePermanentDeleteView(APIView):
    permission_classes = [IsSuperAdmin]

    def delete(self, request, mode_id: int):
        return _handle_permanent_delete(request, delete_work_mode, mode_id=mode_id)


class WorkModeReferenceListView(APIView):
    """Read-only work modes for all authenticated platform users."""

    permission_classes = [IsPlatformAdminOrStudentCatalogRead]

    def get(self, request):
        from .services.academic_structure_management import active_work_modes

        if not WorkMode.objects.filter(is_active=True, is_archived=False).exists():
            seed_default_work_modes()
        lang = _lang(request)
        return Response(
            envelope(
                True,
                'OK',
                data=[serialize_work_mode_ref(w, lang) for w in active_work_modes()],
            ),
        )
