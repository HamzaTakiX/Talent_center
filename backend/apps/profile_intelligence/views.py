"""
API surface for Student Profile Intelligence.

Endpoints are intentionally thin: they validate input, delegate work
to services, then serialize the result. All mutating operations go
through the service layer.
"""

from __future__ import annotations

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts_et_roles.models import StudentProfile

from .models import StudentProfileQueryLog
from .selectors import search_students
from .serializers import (
    ProfileDashboardSerializer,
    SearchFilterSerializer,
    StudentProfileIndicatorSerializer,
)
from .services import profile_intelligence_engine
from .services.suggestion_engine import mark_suggestion_completed


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request, student_id: int):
    """
    GET /api/profile-intelligence/<student_id>/dashboard/

    Returns indicators, active risks, open suggestions and the most
    recent activity — assembled by the engine without mutating state.
    """
    student_profile = get_object_or_404(StudentProfile, pk=student_id)
    view = profile_intelligence_engine.compute_global_profile_view(student_profile)
    data = ProfileDashboardSerializer(view).data
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search(request):
    """
    GET /api/profile-intelligence/search/

    Filterable listing of students with their intelligence state.
    Query parameters are validated by SearchFilterSerializer.
    """
    serializer = SearchFilterSerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)
    filters = serializer.validated_data

    qs = search_students(filters)
    results = [
        {
            'student_profile_id': student.pk,
            'user_id': student.user_id,
            'indicator': (
                StudentProfileIndicatorSerializer(student.indicator).data
                if getattr(student, 'indicator', None) is not None
                else None
            ),
        }
        for student in qs[:200]
    ]

    StudentProfileQueryLog.objects.create(
        executed_by=request.user if request.user.is_authenticated else None,
        query_type='search',
        filters_json=dict(filters),
        result_count=len(results),
    )
    return Response({'count': len(results), 'results': results})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze(request, student_id: int):
    """
    POST /api/profile-intelligence/analyze/<student_id>/

    Force a full recompute: metrics, risks, suggestions, state and
    indicators. Returns the refreshed indicator.
    """
    student_profile = get_object_or_404(StudentProfile, pk=student_id)
    indicator = profile_intelligence_engine.aggregate_profile_data(student_profile)
    return Response(
        StudentProfileIndicatorSerializer(indicator).data,
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_suggestion(request, suggestion_id: int):
    """
    POST /api/profile-intelligence/suggestions/<suggestion_id>/complete/

    Mark a suggestion as completed. Kept separate from analyze() so
    clients can close nudges without triggering a full recompute.
    """
    suggestion = mark_suggestion_completed(suggestion_id)
    return Response({
        'id': suggestion.pk,
        'is_completed': suggestion.is_completed,
        'completed_at': suggestion.completed_at,
    })
