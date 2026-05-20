from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts_et_roles.models import Permission, Role
from apps.authentication.services.credentials import reveal_current_credential
from apps.authentication.utils import envelope
from apps.encadrant.permissions import HasReportPermission

from .models import AcademicLevel, AcademicYear, ClassGroup, Filiere, SpecializationDomain
from .permissions import (
    CanManageAdministrators,
    IsPlatformAdmin,
    IsPlatformAdminOrStudentCatalogRead,
)
from .serializers import (
    AdminAdministratorDetailSerializer,
    AdminAdministratorListSerializer,
    AdminEncadrantDetailSerializer,
    AdminEncadrantListSerializer,
    AdminEncadrantReportListSerializer,
    AdminStudentDetailSerializer,
    AdminStudentListSerializer,
    ClassGroupSerializer,
    CreateAdministratorSerializer,
    CreateEncadrantSerializer,
    CreateStudentSerializer,
    FiliereSerializer,
    PermissionOptionSerializer,
    RoleOptionSerializer,
    UpdateAdministratorSerializer,
    UpdateEncadrantSerializer,
    UpdateStudentAccessSerializer,
    UpdateStudentAssignmentSerializer,
    BulkDeleteUsersSerializer,
)
from .services.academic_reference import (
    active_academic_years,
    active_class_groups,
    active_filieres,
    active_internship_types,
    active_levels,
    active_sectors,
    distinct_academic_years,
    distinct_levels,
    parse_filiere_ids_param,
    parse_level_ids_param,
    request_lang,
    serialize_academic_year,
    serialize_class_group,
    serialize_filiere,
    serialize_internship_type,
    serialize_level,
    serialize_sector,
)
from .services.esca_academic_seed import seed_class_groups, seed_esca_academic
from .services.specialization_domains import (
    list_specialization_domains,
    master_tracks_for_filiere_ids,
    program_families_for_filiere_ids,
    serialize_specialization_domain,
)
from .services.specialization_domains_seed import seed_specialization_domains
from .services.admins import create_platform_admin, list_administrators_queryset, update_platform_admin
from .services.encadrants import (
    create_platform_encadrant,
    list_encadrants_queryset,
    update_platform_encadrant,
)
from .services.rbac_seed import seed_admin_rbac
from .services.scopes import assert_student_in_scope
from .services.administrator_import import import_administrators_from_file
from .services.encadrant_import import import_encadrants_from_file
from .services.encadrant_reports import list_encadrant_reports_for_admin
from .services.encadrant_scope import repair_all_encadrant_scopes
from .services.student_import import import_students_from_file
from .pagination import paginate_queryset, paginated_payload
from .services.students import (
    create_student,
    list_students_queryset,
    regenerate_student_password,
    student_dashboard_stats,
    update_student_access,
    update_student_assignment,
)
from .services.user_deletion import (
    UserDeletionError,
    bulk_delete_platform_users,
    delete_platform_user,
    student_scope_check,
)

User = get_user_model()


class SpecializationDomainListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdminOrStudentCatalogRead]

    def get(self, request):
        if not SpecializationDomain.objects.filter(is_active=True).exists():
            seed_specialization_domains()
        lang = request_lang(request)
        raw_families = request.query_params.get('program_families', '').strip()
        families = [f.strip().upper() for f in raw_families.split(',') if f.strip()] or None
        filiere_ids = parse_filiere_ids_param(request)
        master_tracks: list[str] | None = None
        if filiere_ids and not families:
            families = program_families_for_filiere_ids(filiere_ids) or None
        if filiere_ids and families and 'MASTER' in families:
            master_tracks = master_tracks_for_filiere_ids(filiere_ids) or None
        search = request.query_params.get('search', '').strip()
        category = request.query_params.get('category', '').strip()
        include_tech = request.query_params.get('include_tech', '').lower() in ('1', 'true', 'yes')
        domains = list_specialization_domains(
            program_families=families,
            master_tracks=master_tracks,
            category=category,
            include_tech=include_tech,
            lang=lang,
            search=search,
        )
        return Response(
            envelope(
                True,
                'OK',
                data=[serialize_specialization_domain(d, lang) for d in domains],
            ),
            status=status.HTTP_200_OK,
        )


class FiliereListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdminOrStudentCatalogRead]

    def get(self, request):
        if not Filiere.objects.filter(is_active=True).exists():
            seed_esca_academic()
        lang = request_lang(request)
        family = request.query_params.get('program_family', '').strip() or None
        student_catalog = request.query_params.get('student_catalog', '').lower() in (
            '1',
            'true',
            'yes',
        )
        qs = active_filieres(program_family=family, student_catalog=student_catalog)
        legacy = request.query_params.get('legacy', '').lower() in ('1', 'true')
        if legacy:
            return Response(
                envelope(True, 'OK', data=FiliereSerializer(qs, many=True).data),
                status=status.HTTP_200_OK,
            )
        return Response(
            envelope(True, 'OK', data=[serialize_filiere(f, lang) for f in qs]),
            status=status.HTTP_200_OK,
        )


class ClassGroupListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdminOrStudentCatalogRead]

    def get(self, request):
        if not ClassGroup.objects.filter(is_active=True).exists():
            if Filiere.objects.filter(is_active=True).exists():
                seed_class_groups()
            else:
                seed_esca_academic()
        filiere_ids = parse_filiere_ids_param(request)
        level_ids = parse_level_ids_param(request)
        sector_raw = request.query_params.get('sector_id') or request.query_params.get('academic_sector_id')
        sector_ids = [int(sector_raw)] if sector_raw and str(sector_raw).isdigit() else None
        academic_year = request.query_params.get('academic_year', '').strip() or None
        qs = active_class_groups(
            filiere_ids=filiere_ids or None,
            academic_year=academic_year,
            level_ids=level_ids or None,
            sector_ids=sector_ids,
        )
        lang = request_lang(request)
        legacy = request.query_params.get('legacy', '').lower() in ('1', 'true')
        if legacy:
            return Response(
                envelope(True, 'OK', data=ClassGroupSerializer(qs, many=True).data),
                status=status.HTTP_200_OK,
            )
        return Response(
            envelope(True, 'OK', data=[serialize_class_group(cg, lang) for cg in qs]),
            status=status.HTTP_200_OK,
        )


class AcademicYearListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdminOrStudentCatalogRead]

    def get(self, request):
        structured = request.query_params.get('structured', '').lower() in ('1', 'true')
        if structured:
            if not AcademicYear.objects.filter(is_active=True).exists():
                seed_esca_academic()
            data = [serialize_academic_year(y) for y in active_academic_years()]
            return Response(envelope(True, 'OK', data=data), status=status.HTTP_200_OK)
        filiere_ids = parse_filiere_ids_param(request)
        years = distinct_academic_years(filiere_ids=filiere_ids or None)
        return Response(
            envelope(True, 'OK', data=years),
            status=status.HTTP_200_OK,
        )


class AcademicLevelListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdminOrStudentCatalogRead]

    def get(self, request):
        filiere_ids = parse_filiere_ids_param(request)
        legacy_strings = request.query_params.get('legacy', '').lower() in ('1', 'true')
        if legacy_strings:
            academic_year = request.query_params.get('academic_year', '').strip() or None
            class_group_ids = [
                int(x)
                for x in request.query_params.get('class_group_ids', '').split(',')
                if x.strip().isdigit()
            ]
            if not filiere_ids:
                return Response(envelope(True, 'OK', data=[]), status=status.HTTP_200_OK)
            levels = distinct_levels(
                filiere_ids=filiere_ids,
                academic_year=academic_year,
                class_group_ids=class_group_ids or None,
            )
            return Response(envelope(True, 'OK', data=levels), status=status.HTTP_200_OK)

        if not filiere_ids:
            return Response(envelope(True, 'OK', data=[]), status=status.HTTP_200_OK)
        if not AcademicLevel.objects.filter(is_active=True).exists():
            seed_esca_academic()
        lang = request_lang(request)
        qs = active_levels(filiere_ids=filiere_ids)
        return Response(
            envelope(True, 'OK', data=[serialize_level(level, lang) for level in qs]),
            status=status.HTTP_200_OK,
        )


class AcademicSectorListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdminOrStudentCatalogRead]

    def get(self, request):
        level_ids = parse_level_ids_param(request)
        if not level_ids:
            return Response(envelope(True, 'OK', data=[]), status=status.HTTP_200_OK)
        lang = request_lang(request)
        qs = active_sectors(level_ids=level_ids)
        return Response(
            envelope(True, 'OK', data=[serialize_sector(s, lang) for s in qs]),
            status=status.HTTP_200_OK,
        )


class InternshipTypeListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdminOrStudentCatalogRead]

    def get(self, request):
        lang = request_lang(request)
        list_all = request.query_params.get('all', '').lower() in ('1', 'true', 'yes')
        level_ids = parse_level_ids_param(request)
        if not level_ids:
            if list_all:
                qs = active_internship_types()
                return Response(
                    envelope(True, 'OK', data=[serialize_internship_type(item, lang) for item in qs]),
                    status=status.HTTP_200_OK,
                )
            return Response(envelope(True, 'OK', data=[]), status=status.HTTP_200_OK)
        sector_raw = request.query_params.get('sector_id') or request.query_params.get('academic_sector_id')
        sector_id = int(sector_raw) if sector_raw and str(sector_raw).isdigit() else None
        qs = active_internship_types(level_ids=level_ids, sector_id=sector_id)
        return Response(
            envelope(True, 'OK', data=[serialize_internship_type(item, lang) for item in qs]),
            status=status.HTTP_200_OK,
        )


class AcademicStructureSeedView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def post(self, request):
        result = seed_esca_academic()
        return Response(envelope(True, 'ESCA academic structure seeded', data=result), status=status.HTTP_200_OK)


class AdminStudentStatsView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        return Response(
            envelope(True, 'OK', data=student_dashboard_stats(acting_user=request.user)),
            status=status.HTTP_200_OK,
        )


class AdminStudentListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', '')
        from .services.students import annotate_students_with_internship_assignment

        qs = annotate_students_with_internship_assignment(
            list_students_queryset(
                search=search, status=status_filter, acting_user=request.user,
            )
        )
        page_items, meta = paginate_queryset(qs, request)
        return Response(
            envelope(
                True,
                'OK',
                data=paginated_payload(
                    AdminStudentListSerializer(page_items, many=True).data,
                    meta,
                ),
            ),
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = CreateStudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            user = create_student(created_by=request.user, **data)
        except ValueError as exc:
            field = 'email' if 'email' in str(exc).lower() else 'academic'
            return Response(
                envelope(False, str(exc), errors={field: [str(exc)]}),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            envelope(True, 'Student created', data=AdminStudentDetailSerializer(user).data),
            status=status.HTTP_201_CREATED,
        )


class AdminStudentImportView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def post(self, request):
        upload = request.FILES.get('file')
        if upload is None:
            return Response(
                envelope(False, 'No file uploaded. Use field name "file".'),
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            content = upload.read()
            result = import_students_from_file(
                content=content,
                filename=upload.name or 'import.csv',
                created_by=request.user,
            )
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        message = (
            f'{result["success_rows"]} student(s) created, {result["error_rows"]} error(s).'
        )
        http_status = (
            status.HTTP_201_CREATED
            if result['error_rows'] == 0
            else status.HTTP_200_OK
        )
        return Response(envelope(True, message, data=result), status=http_status)


class AdminEncadrantImportView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def post(self, request):
        upload = request.FILES.get('file')
        if upload is None:
            return Response(
                envelope(False, 'No file uploaded. Use field name "file".'),
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            content = upload.read()
            result = import_encadrants_from_file(
                content=content,
                filename=upload.name or 'import.csv',
                created_by=request.user,
            )
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        message = (
            f'{result["success_rows"]} supervisor(s) created, {result["error_rows"]} error(s).'
        )
        http_status = (
            status.HTTP_201_CREATED
            if result['error_rows'] == 0
            else status.HTTP_200_OK
        )
        return Response(envelope(True, message, data=result), status=http_status)


class AdminEncadrantRepairScopesView(APIView):
    """Infer missing academic levels, years, and supervised internship types for encadrants."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def post(self, request):
        dry_run = str(request.data.get('dry_run', 'false')).lower() in ('1', 'true', 'yes')
        result = repair_all_encadrant_scopes(dry_run=dry_run)
        message = (
            f'{result["repaired"]} encadrant(s) would be updated (dry run).'
            if dry_run
            else f'{result["repaired"]} encadrant(s) updated.'
        )
        return Response(envelope(True, message, data=result), status=status.HTTP_200_OK)


class AdminAdministratorImportView(APIView):
    permission_classes = [IsAuthenticated, CanManageAdministrators]

    def post(self, request):
        upload = request.FILES.get('file')
        if upload is None:
            return Response(
                envelope(False, 'No file uploaded. Use field name "file".'),
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            content = upload.read()
            result = import_administrators_from_file(
                content=content,
                filename=upload.name or 'import.csv',
                created_by=request.user,
            )
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        message = (
            f'{result["success_rows"]} administrator(s) created, {result["error_rows"]} error(s).'
        )
        http_status = (
            status.HTTP_201_CREATED
            if result['error_rows'] == 0
            else status.HTTP_200_OK
        )
        return Response(envelope(True, message, data=result), status=http_status)


class AdminStudentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request, student_id: int):
        user = list_students_queryset(acting_user=request.user).filter(pk=student_id).first()
        if user is None:
            return Response(
                envelope(False, 'Student not found'),
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            assert_student_in_scope(request.user, user)
        except PermissionDenied as exc:
            return Response(envelope(False, str(exc.detail)), status=status.HTTP_403_FORBIDDEN)
        return Response(
            envelope(True, 'OK', data=AdminStudentDetailSerializer(user).data),
            status=status.HTTP_200_OK,
        )

    def delete(self, request, student_id: int):
        user = list_students_queryset(acting_user=request.user).filter(pk=student_id).first()
        if user is None:
            return Response(envelope(False, 'Student not found'), status=status.HTTP_404_NOT_FOUND)
        try:
            delete_platform_user(
                user=user,
                acting_user=request.user,
                expected_role=User.RoleChoices.STUDENT,
                scope_check=student_scope_check(request.user),
            )
        except UserDeletionError as exc:
            return Response(
                envelope(False, str(exc), errors={exc.field: [str(exc)]}),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(envelope(True, 'Student deleted'), status=status.HTTP_200_OK)


class AdminStudentBulkDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def post(self, request):
        serializer = BulkDeleteUsersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = bulk_delete_platform_users(
            user_ids=serializer.validated_data['ids'],
            acting_user=request.user,
            expected_role=User.RoleChoices.STUDENT,
            queryset=list_students_queryset(acting_user=request.user),
            scope_check=student_scope_check(request.user),
        )
        deleted = len(result['deleted_ids'])
        failed = len(result['failed'])
        message = f'{deleted} student(s) deleted' + (f', {failed} failed' if failed else '')
        return Response(envelope(True, message, data=result), status=status.HTTP_200_OK)


class AdminStudentAccessView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def patch(self, request, student_id: int):
        user = list_students_queryset(acting_user=request.user).filter(pk=student_id).first()
        if user is None:
            return Response(envelope(False, 'Student not found'), status=status.HTTP_404_NOT_FOUND)
        try:
            assert_student_in_scope(request.user, user)
        except PermissionDenied as exc:
            return Response(envelope(False, str(exc.detail)), status=status.HTTP_403_FORBIDDEN)
        serializer = UpdateStudentAccessSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        reason = data.pop('reason', '')
        user = update_student_access(user=user, changed_by=request.user, reason=reason, **data)
        return Response(
            envelope(True, 'Access updated', data=AdminStudentDetailSerializer(user).data),
            status=status.HTTP_200_OK,
        )


class AdminStudentAssignmentView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def patch(self, request, student_id: int):
        user = list_students_queryset(acting_user=request.user).filter(pk=student_id).first()
        if user is None:
            return Response(envelope(False, 'Student not found'), status=status.HTTP_404_NOT_FOUND)
        try:
            assert_student_in_scope(request.user, user)
        except PermissionDenied as exc:
            return Response(envelope(False, str(exc.detail)), status=status.HTTP_403_FORBIDDEN)
        serializer = UpdateStudentAssignmentSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            update_student_assignment(user=user, assigned_by=request.user, **serializer.validated_data)
        except ValueError as exc:
            return Response(
                envelope(False, str(exc), errors={'academic': [str(exc)]}),
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = list_students_queryset().get(pk=student_id)
        return Response(
            envelope(True, 'Assignment updated', data=AdminStudentDetailSerializer(user).data),
            status=status.HTTP_200_OK,
        )


class AdminStudentRegeneratePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def post(self, request, student_id: int):
        user = User.objects.filter(pk=student_id, role=User.RoleChoices.STUDENT).first()
        if user is None:
            return Response(envelope(False, 'Student not found'), status=status.HTTP_404_NOT_FOUND)
        regenerate_student_password(user=user, generated_by=request.user)
        return Response(
            envelope(True, 'Password regenerated. Use reveal to view once.', data={'regenerated': True}),
            status=status.HTTP_200_OK,
        )


class AdminStudentRevealCredentialView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def post(self, request, student_id: int):
        user = User.objects.filter(pk=student_id, role=User.RoleChoices.STUDENT).first()
        if user is None:
            return Response(envelope(False, 'Student not found'), status=status.HTTP_404_NOT_FOUND)
        try:
            password = reveal_current_credential(user=user, revealed_by=request.user)
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            envelope(True, 'Credential revealed', data={'password': password}),
            status=status.HTTP_200_OK,
        )


class AdminRbacSeedView(APIView):
    permission_classes = [IsAuthenticated, CanManageAdministrators]

    def post(self, request):
        result = seed_admin_rbac()
        return Response(envelope(True, 'RBAC seeded', data=result), status=status.HTTP_200_OK)


class RoleListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        seed_admin_rbac()
        qs = Role.objects.filter(code__startswith='ADMIN_').order_by('code')
        return Response(
            envelope(True, 'OK', data=RoleOptionSerializer(qs, many=True).data),
            status=status.HTTP_200_OK,
        )


class PermissionListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        seed_admin_rbac()
        qs = Permission.objects.all().order_by('module', 'code')
        return Response(
            envelope(True, 'OK', data=PermissionOptionSerializer(qs, many=True).data),
            status=status.HTTP_200_OK,
        )


class AdminAdministratorListCreateView(APIView):
    permission_classes = [IsAuthenticated, CanManageAdministrators]

    def get(self, request):
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', '')
        role_filter = request.query_params.get('role', '')
        qs = list_administrators_queryset(search=search, status=status_filter, role=role_filter)
        page_items, meta = paginate_queryset(qs, request)
        return Response(
            envelope(
                True,
                'OK',
                data=paginated_payload(
                    AdminAdministratorListSerializer(page_items, many=True).data,
                    meta,
                ),
            ),
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = CreateAdministratorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            user = create_platform_admin(created_by=request.user, **data)
        except ValueError as exc:
            return Response(
                envelope(False, str(exc), errors={'email': [str(exc)]}),
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = list_administrators_queryset().get(pk=user.pk)
        return Response(
            envelope(True, 'Administrator created', data=AdminAdministratorDetailSerializer(user).data),
            status=status.HTTP_201_CREATED,
        )


class AdminAdministratorDetailView(APIView):
    permission_classes = [IsAuthenticated, CanManageAdministrators]

    def get(self, request, admin_id: int):
        user = list_administrators_queryset().filter(pk=admin_id).first()
        if user is None:
            return Response(envelope(False, 'Administrator not found'), status=status.HTTP_404_NOT_FOUND)
        return Response(
            envelope(True, 'OK', data=AdminAdministratorDetailSerializer(user).data),
            status=status.HTTP_200_OK,
        )

    def patch(self, request, admin_id: int):
        user = User.objects.filter(pk=admin_id, role=User.RoleChoices.ADMIN).first()
        if user is None:
            return Response(envelope(False, 'Administrator not found'), status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateAdministratorSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        reason = data.pop('reason', '')
        try:
            user = update_platform_admin(user=user, changed_by=request.user, reason=reason, **data)
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = list_administrators_queryset().get(pk=user.pk)
        return Response(
            envelope(True, 'Administrator updated', data=AdminAdministratorDetailSerializer(user).data),
            status=status.HTTP_200_OK,
        )

    def delete(self, request, admin_id: int):
        user = list_administrators_queryset().filter(pk=admin_id).first()
        if user is None:
            return Response(envelope(False, 'Administrator not found'), status=status.HTTP_404_NOT_FOUND)
        try:
            delete_platform_user(
                user=user,
                acting_user=request.user,
                expected_role=User.RoleChoices.ADMIN,
            )
        except UserDeletionError as exc:
            return Response(
                envelope(False, str(exc), errors={exc.field: [str(exc)]}),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(envelope(True, 'Administrator deleted'), status=status.HTTP_200_OK)


class AdminAdministratorBulkDeleteView(APIView):
    permission_classes = [IsAuthenticated, CanManageAdministrators]

    def post(self, request):
        serializer = BulkDeleteUsersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = bulk_delete_platform_users(
            user_ids=serializer.validated_data['ids'],
            acting_user=request.user,
            expected_role=User.RoleChoices.ADMIN,
            queryset=list_administrators_queryset(),
        )
        deleted = len(result['deleted_ids'])
        failed = len(result['failed'])
        message = f'{deleted} administrator(s) deleted' + (f', {failed} failed' if failed else '')
        return Response(envelope(True, message, data=result), status=status.HTTP_200_OK)


class AdminEncadrantListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request):
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', '')
        qs = list_encadrants_queryset(search=search, status=status_filter)
        page_items, meta = paginate_queryset(qs, request)
        return Response(
            envelope(
                True,
                'OK',
                data=paginated_payload(
                    AdminEncadrantListSerializer(
                        page_items,
                        many=True,
                        context={'request': request},
                    ).data,
                    meta,
                ),
            ),
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = CreateEncadrantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = create_platform_encadrant(created_by=request.user, **serializer.validated_data)
        except ValueError as exc:
            field = 'email' if 'email' in str(exc).lower() else 'academic'
            return Response(
                envelope(False, str(exc), errors={field: [str(exc)]}),
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = list_encadrants_queryset().get(pk=user.pk)
        return Response(
            envelope(
                True,
                'Supervisor created',
                data=AdminEncadrantDetailSerializer(user, context={'request': request}).data,
            ),
            status=status.HTTP_201_CREATED,
        )


class AdminEncadrantDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def get(self, request, encadrant_id: int):
        user = list_encadrants_queryset().filter(pk=encadrant_id).first()
        if user is None:
            return Response(
                envelope(False, 'Supervisor not found'),
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            envelope(
                True,
                'OK',
                data=AdminEncadrantDetailSerializer(user, context={'request': request}).data,
            ),
            status=status.HTTP_200_OK,
        )

    def patch(self, request, encadrant_id: int):
        user = User.objects.filter(pk=encadrant_id, role=User.RoleChoices.SUPERVISOR).first()
        if user is None:
            return Response(envelope(False, 'Supervisor not found'), status=status.HTTP_404_NOT_FOUND)
        serializer = UpdateEncadrantSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        reason = data.pop('reason', '')
        try:
            user = update_platform_encadrant(user=user, changed_by=request.user, reason=reason, **data)
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = list_encadrants_queryset().get(pk=user.pk)
        return Response(
            envelope(
                True,
                'Supervisor updated',
                data=AdminEncadrantDetailSerializer(user, context={'request': request}).data,
            ),
            status=status.HTTP_200_OK,
        )

    def delete(self, request, encadrant_id: int):
        user = list_encadrants_queryset().filter(pk=encadrant_id).first()
        if user is None:
            return Response(envelope(False, 'Supervisor not found'), status=status.HTTP_404_NOT_FOUND)
        try:
            delete_platform_user(
                user=user,
                acting_user=request.user,
                expected_role=User.RoleChoices.SUPERVISOR,
            )
        except UserDeletionError as exc:
            return Response(
                envelope(False, str(exc), errors={exc.field: [str(exc)]}),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(envelope(True, 'Supervisor deleted'), status=status.HTTP_200_OK)


class AdminEncadrantBulkDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin]

    def post(self, request):
        serializer = BulkDeleteUsersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = bulk_delete_platform_users(
            user_ids=serializer.validated_data['ids'],
            acting_user=request.user,
            expected_role=User.RoleChoices.SUPERVISOR,
            queryset=list_encadrants_queryset(),
        )
        deleted = len(result['deleted_ids'])
        failed = len(result['failed'])
        message = f'{deleted} supervisor(s) deleted' + (f', {failed} failed' if failed else '')
        return Response(envelope(True, message, data=result), status=status.HTTP_200_OK)


class AdminEncadrantReportsListView(APIView):
    """Rapports de supervision soumis par les encadrants (réception admin — legacy path)."""

    permission_classes = [IsAuthenticated, HasReportPermission]
    required_permission = 'reports.access'

    def get(self, request):
        rows = list_encadrant_reports_for_admin(request.user)
        serializer = AdminEncadrantReportListSerializer(rows, many=True)
        return Response(
            envelope(True, 'OK', data={'items': serializer.data}),
            status=status.HTTP_200_OK,
        )
