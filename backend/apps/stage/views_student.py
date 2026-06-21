"""Student-facing internship journey API views."""

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts_et_roles.permissions import IsStudent
from apps.authentication.utils import envelope

from .models import InternshipOffer, OfferApplication
from .services.student_journey_service import (
    build_journey_dashboard,
    build_offers_feed,
    get_application_readiness,
    get_application_timeline,
    get_match_for_offer,
    list_student_applications,
)


class StudentJourneyDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        student = request.user.student_profile
        return Response(envelope(True, 'Journey dashboard loaded', data=build_journey_dashboard(student)))


class StudentMyApplicationsView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        student = request.user.student_profile
        active_only = request.query_params.get('active') == 'true'
        apps = list_student_applications(student, active_only=active_only)
        return Response(envelope(True, 'Applications loaded', data=apps))


class StudentApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, app_uuid):
        student = request.user.student_profile
        application = get_object_or_404(
            OfferApplication.objects.select_related('offer'),
            uuid=app_uuid,
            student_profile=student,
        )
        from .services.student_journey_service import _serialize_application

        data = _serialize_application(application)
        data['timeline'] = get_application_timeline(application)
        data['interviews'] = [
            {
                'uuid': str(i.uuid),
                'status': i.status,
                'scheduled_at': i.scheduled_at.isoformat(),
                'interview_type': i.interview_type,
            }
            for i in application.interviews.all().order_by('-scheduled_at')
        ]
        return Response(envelope(True, 'Application loaded', data=data))


class StudentOffersFeedView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        student = request.user.student_profile
        return Response(envelope(True, 'Offers feed loaded', data=build_offers_feed(student)))


class StudentApplicationReadinessView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, uuid):
        student = request.user.student_profile
        offer = get_object_or_404(InternshipOffer, uuid=uuid)
        return Response(
            envelope(True, 'Readiness loaded', data=get_application_readiness(student, offer)),
        )


class StudentOfferMatchView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, uuid):
        student = request.user.student_profile
        offer = get_object_or_404(InternshipOffer, uuid=uuid)
        return Response(envelope(True, 'Match loaded', data=get_match_for_offer(student, offer)))
