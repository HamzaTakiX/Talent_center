"""Student-facing internship journey API views."""

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts_et_roles.permissions import IsStudent
from apps.authentication.utils import envelope
from apps.career_coach.services.context_builder import build_context_panel, build_student_context

from .models import InternshipOffer, OfferApplication
from .serializers import ImportUrlSerializer, InterviewSimulatorContextRequestSerializer
from .services.exceptions import StageServiceError
from .services.offer_import_service import preview_offer_from_url
from .services.student_journey_service import (
    build_journey_dashboard,
    build_offers_feed,
    get_application_readiness,
    get_application_timeline,
    get_match_for_offer,
    list_student_applications,
)
from .views import _handle_service_error


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


class StudentOfferUrlPreviewView(APIView):
    """Preview offer fields extracted from a job URL (interview simulator, no admin import)."""

    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        ser = ImportUrlSerializer(data=request.data)
        if not ser.is_valid():
            return Response(envelope(False, 'Validation error', errors=ser.errors), status=400)
        try:
            data = preview_offer_from_url(ser.validated_data['source_url'])
        except StageServiceError as exc:
            return _handle_service_error(exc)
        return Response(envelope(True, 'Offer preview extracted', data=data))


class StudentInterviewSimulatorContextView(APIView):
    """Build a normalized bundle of offer + student context for interview simulation.

    This is a read-only collector used by the interview simulator to generate
    accurate, personalized questions (offer requirements + student profile/CV signals).
    """

    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        student = request.user.student_profile

        ser = InterviewSimulatorContextRequestSerializer(data=request.data)
        if not ser.is_valid():
            return Response(envelope(False, 'Validation error', errors=ser.errors), status=400)

        offer_uuid = ser.validated_data.get('offer_uuid')
        source_url = ser.validated_data.get('source_url') or ''

        # Candidate context: use existing, battle-tested collector.
        try:
            candidate_context = build_student_context(student, offer_uuid=str(offer_uuid) if offer_uuid else None)
            candidate_panel = build_context_panel(student, use_cache_only=False)
        except Exception as exc:
            return Response(
                envelope(False, f'Failed to build candidate context: {exc}'),
                status=503,
            )

        offer_context = None
        offer_ref: dict | None = None

        # Offer from platform
        if offer_uuid:
            offer = candidate_context.get('current_offer')
            if offer:
                offer_context = offer
                offer_ref = {'type': 'platform', 'offer_uuid': str(offer_uuid)}
            else:
                # Explicit 404 to avoid silently simulating the wrong offer
                return Response(envelope(False, 'Offer not found.'), status=404)

        # Offer from external URL (extract/preview)
        if source_url:
            try:
                preview = preview_offer_from_url(source_url)
            except StageServiceError as exc:
                return _handle_service_error(exc)
            except Exception as exc:
                return Response(
                    envelope(False, f'Offer extraction failed: {exc}'),
                    status=503,
                )

            offer_context = {
                'id': None,
                'title': preview.get('title', ''),
                'company': preview.get('company_name', ''),
                'description': (preview.get('description', '') or '')[:2000],
                'requirements': preview.get('requirements', ''),
                'required_skills': preview.get('required_skills') or [],
                'location_city': preview.get('location_city', ''),
                'source_platform': preview.get('source_platform', ''),
                'source_url': preview.get('source_url', source_url),
                'parser_used': preview.get('parser_used', ''),
            }
            offer_ref = {'type': 'external_url', 'source_url': source_url}

        data = {
            'offer_ref': offer_ref,
            'offer': offer_context,
            'candidate': {
                'student_id': candidate_context.get('student_id'),
                'profile': candidate_context.get('profile') or {},
                'cv': candidate_context.get('cv') or {},
                'interview': candidate_context.get('interview') or {},
                'panel': candidate_panel or {},
                'built_at': timezone.now().isoformat(),
            },
        }
        return Response(envelope(True, 'Interview simulator context built.', data=data))
