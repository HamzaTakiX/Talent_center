"""API views for the intelligent encadrant assignment system."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope

from .models import Assignment
from .permissions import EffectiveHasPermission, IsPlatformAdmin, IsSuperAdmin
from .serializers import (
    SmartAssignmentLockSerializer,
    SmartAssignmentReassignSerializer,
    SmartAssignmentRunSerializer,
)
from .services.scopes import is_super_admin
from .services.smart_assignment import (
    build_assignment_results_payload,
    manual_reassign_student,
    run_smart_assignment_engine,
)
from .services.smart_assignment_analytics import build_smart_assignment_internship_analytics
from .services.smart_assignment_validation import run_smart_assignment_precheck


class SmartAssignmentResultsView(APIView):
    """Current assignment distribution for an academic year."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'students.manage'

    def get(self, request):
        academic_year = request.query_params.get('academic_year', '')
        try:
            data = build_assignment_results_payload(academic_year)
            data['internship_analytics'] = build_smart_assignment_internship_analytics(
                academic_year=academic_year,
            )
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(envelope(True, 'OK', data=data), status=status.HTTP_200_OK)


class SmartAssignmentAnalyticsView(APIView):
    """Internship-type analytics for the smart assignment dashboard."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'students.manage'

    def get(self, request):
        academic_year = request.query_params.get('academic_year', '')
        try:
            data = build_smart_assignment_internship_analytics(academic_year=academic_year)
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(envelope(True, 'OK', data=data), status=status.HTTP_200_OK)


class SmartAssignmentPrecheckView(APIView):
    """Validate prerequisites before running the assignment engine."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'students.manage'

    def post(self, request):
        serializer = SmartAssignmentRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            result = run_smart_assignment_precheck(
                academic_year=data.get('academic_year', ''),
                excluded_student_ids=data.get('excluded_student_ids'),
                excluded_encadrant_ids=data.get('excluded_encadrant_ids'),
                respect_locks=data.get('respect_locks', True),
            )
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            envelope(True, 'Precheck completed', data=result),
            status=status.HTTP_200_OK,
        )


class SmartAssignmentPreviewView(APIView):
    """Dry-run the assignment engine without persisting."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'students.manage'

    def post(self, request):
        serializer = SmartAssignmentRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if not data.get('skip_validation'):
            precheck = run_smart_assignment_precheck(
                academic_year=data.get('academic_year', ''),
                excluded_student_ids=data.get('excluded_student_ids'),
                excluded_encadrant_ids=data.get('excluded_encadrant_ids'),
                respect_locks=data.get('respect_locks', True),
            )
            if precheck['has_blocking_errors']:
                return Response(
                    envelope(False, 'Assignment precheck failed', data=precheck),
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )
        try:
            result = run_smart_assignment_engine(
                dry_run=True,
                assigned_by=request.user,
                academic_year=data.get('academic_year', ''),
                excluded_student_ids=data.get('excluded_student_ids'),
                excluded_encadrant_ids=data.get('excluded_encadrant_ids'),
                respect_locks=data.get('respect_locks', True),
                assignment_strategy=data.get('assignment_strategy', 'full'),
            )
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            envelope(True, 'Preview generated', data=result),
            status=status.HTTP_200_OK,
        )


class SmartAssignmentRunView(APIView):
    """Execute the assignment engine and persist results."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'students.manage'

    def post(self, request):
        if not is_super_admin(request.user):
            return Response(
                envelope(False, 'Only super administrators can run the assignment engine.'),
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = SmartAssignmentRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if not data.get('skip_validation'):
            precheck = run_smart_assignment_precheck(
                academic_year=data.get('academic_year', ''),
                excluded_student_ids=data.get('excluded_student_ids'),
                excluded_encadrant_ids=data.get('excluded_encadrant_ids'),
                respect_locks=data.get('respect_locks', True),
            )
            if precheck['has_blocking_errors']:
                return Response(
                    envelope(False, 'Assignment precheck failed', data=precheck),
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )
            if precheck['has_warnings'] and not data.get('confirm_warnings'):
                return Response(
                    envelope(False, 'Assignment precheck requires confirmation', data=precheck),
                    status=status.HTTP_409_CONFLICT,
                )
        try:
            result = run_smart_assignment_engine(
                dry_run=False,
                assigned_by=request.user,
                academic_year=data.get('academic_year', ''),
                excluded_student_ids=data.get('excluded_student_ids'),
                excluded_encadrant_ids=data.get('excluded_encadrant_ids'),
                respect_locks=data.get('respect_locks', True),
                assignment_strategy=data.get('assignment_strategy', 'full'),
            )
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            envelope(True, 'Assignment engine completed', data=result),
            status=status.HTTP_200_OK,
        )


class SmartAssignmentReassignView(APIView):
    """Manually move a student to another encadrant."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'students.manage'

    def patch(self, request):
        if not is_super_admin(request.user):
            return Response(
                envelope(False, 'Only super administrators can manually reassign students.'),
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = SmartAssignmentReassignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            assignment = manual_reassign_student(
                student_profile_id=data['student_profile_id'],
                encadrant_profile_id=data.get('encadrant_profile_id'),
                academic_year=data.get('academic_year', ''),
                assigned_by=request.user,
                lock=data.get('lock'),
            )
        except ValueError as exc:
            return Response(
                envelope(False, str(exc)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Assignment.DoesNotExist:
            return Response(
                envelope(False, 'Active assignment not found for this student and year.'),
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            envelope(
                True,
                'Student reassigned',
                data={
                    'assignment_id': assignment.pk,
                    'encadrant_profile_id': assignment.encadrant_profile_id,
                    'is_locked': assignment.is_locked,
                },
            ),
            status=status.HTTP_200_OK,
        )


class SmartAssignmentLockView(APIView):
    """Lock or unlock an assignment from automatic reassignment."""

    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def patch(self, request):
        serializer = SmartAssignmentLockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            assignment = Assignment.objects.get(pk=data['assignment_id'], is_active=True)
        except Assignment.DoesNotExist:
            return Response(
                envelope(False, 'Assignment not found'),
                status=status.HTTP_404_NOT_FOUND,
            )
        assignment.is_locked = data['is_locked']
        assignment.save(update_fields=['is_locked', 'updated_at'])
        return Response(
            envelope(True, 'Assignment lock updated', data={'is_locked': assignment.is_locked}),
            status=status.HTTP_200_OK,
        )
