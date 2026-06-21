"""Extended REST views — Company, Interview, Collections, Pipeline, Recommendations, Webhooks, Chat."""

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts_et_roles.permissions import IsStudent
from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.authentication.utils import envelope

from .models import CandidateCollection, InternshipOffer, OfferApplication
from .models_extended import Company, Interview, WebhookSubscription
from .permissions import CanManageInternshipOffers, STAGE_MANAGE_PERMISSION
from .services.chat_service import (
    get_or_create_offer_conversation,
    message_history,
    send_offer_message,
    total_unread_for_user,
)
from .services.collection_service import (
    add_student_to_collection,
    collection_analytics,
    create_collection,
    export_collection_payload,
    rank_collection,
    remove_student_from_collection,
)
from .services.company_service import (
    archive_company,
    blacklist_company,
    company_analytics,
    create_company,
    update_company,
    verify_company,
)
from .services.exceptions import StageServiceError
from .services.interview_service import cancel_interview, record_interview_result, reschedule_interview, submit_interview_feedback
from .services.offer_versioning import list_offer_versions, restore_offer_version
from .services.permissions import user_can_manage_offers
from .services.pipeline_service import build_pipeline_board, pipeline_metrics, seed_default_pipeline_columns
from .services.recommendation_service import generate_all_recommendations, get_student_recommendation_feed
from .services.webhook_service import SUPPORTED_WEBHOOK_EVENTS


def _err(exc: StageServiceError) -> Response:
    return Response(envelope(False, exc.message, errors={'code': exc.code}), status=400)


class CompanyListCreateView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request):
        qs = Company.objects.exclude(status=Company.Status.BLACKLISTED).order_by('name')
        data = [
            {'uuid': str(c.uuid), 'name': c.name, 'status': c.status, 'sector': c.sector, 'city': c.city}
            for c in qs[:200]
        ]
        return Response(envelope(True, 'Companies loaded', data=data))

    def post(self, request):
        try:
            company = create_company(actor=request.user, data=request.data)
        except StageServiceError as exc:
            return _err(exc)
        return Response(envelope(True, 'Company created', data={'uuid': str(company.uuid)}), status=201)


class CompanyDetailView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request, uuid):
        company = get_object_or_404(Company, uuid=uuid)
        return Response(envelope(True, 'Company loaded', data={
            'uuid': str(company.uuid),
            'name': company.name,
            'status': company.status,
            'website': company.website,
            'analytics': company_analytics(company),
        }))

    def patch(self, request, uuid):
        company = get_object_or_404(Company, uuid=uuid)
        try:
            company = update_company(company=company, actor=request.user, data=request.data)
        except StageServiceError as exc:
            return _err(exc)
        return Response(envelope(True, 'Company updated', data={'uuid': str(company.uuid)}))


class CompanyActionView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def post(self, request, uuid, action):
        company = get_object_or_404(Company, uuid=uuid)
        try:
            if action == 'verify':
                company = verify_company(company=company, actor=request.user, notes=request.data.get('notes', ''))
            elif action == 'blacklist':
                company = blacklist_company(company=company, actor=request.user, reason=request.data.get('reason', ''))
            elif action == 'archive':
                company = archive_company(company=company, actor=request.user)
            else:
                return Response(envelope(False, f'Unknown action: {action}'), status=400)
        except StageServiceError as exc:
            return _err(exc)
        return Response(envelope(True, f'Action {action} applied', data={'status': company.status}))


class InterviewListView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request, app_uuid):
        application = get_object_or_404(OfferApplication, uuid=app_uuid)
        interviews = application.interviews.all()
        data = [
            {
                'uuid': str(i.uuid),
                'status': i.status,
                'scheduled_at': i.scheduled_at.isoformat(),
                'interview_type': i.interview_type,
                'simulator_session_id': i.simulator_session_id,
            }
            for i in interviews
        ]
        return Response(envelope(True, 'Interviews loaded', data=data))


class InterviewActionView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def post(self, request, interview_uuid, action):
        interview = get_object_or_404(Interview, uuid=interview_uuid)
        try:
            if action == 'reschedule':
                from django.utils.dateparse import parse_datetime
                new_at = parse_datetime(request.data.get('scheduled_at', ''))
                interview = reschedule_interview(interview=interview, actor=request.user, new_scheduled_at=new_at, reason=request.data.get('reason', ''))
            elif action == 'cancel':
                interview = cancel_interview(interview=interview, actor=request.user, reason=request.data.get('reason', ''))
            elif action == 'feedback':
                submit_interview_feedback(interview=interview, actor=request.user, data=request.data)
            elif action == 'result':
                record_interview_result(interview=interview, actor=request.user, outcome=request.data.get('outcome', 'PENDING'), notes=request.data.get('notes', ''))
            else:
                return Response(envelope(False, f'Unknown action: {action}'), status=400)
        except (StageServiceError, ValueError) as exc:
            return Response(envelope(False, str(exc)), status=400)
        return Response(envelope(True, f'Interview {action} applied', data={'status': interview.status}))


class CollectionListCreateView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request):
        qs = CandidateCollection.objects.filter(owner=request.user) | CandidateCollection.objects.filter(is_shared=True)
        data = [collection_analytics(c) for c in qs.distinct()[:100]]
        return Response(envelope(True, 'Collections loaded', data=data))

    def post(self, request):
        linked = None
        if request.data.get('linked_offer_uuid'):
            linked = get_object_or_404(InternshipOffer, uuid=request.data['linked_offer_uuid'])
        collection = create_collection(
            actor=request.user,
            name=request.data.get('name', 'Collection'),
            description=request.data.get('description', ''),
            linked_offer=linked,
            is_shared=request.data.get('is_shared', False),
        )
        return Response(envelope(True, 'Collection created', data={'id': collection.pk}), status=201)


class CollectionDetailView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request, collection_id):
        collection = get_object_or_404(CandidateCollection, pk=collection_id)
        return Response(envelope(True, 'Collection loaded', data={
            'analytics': collection_analytics(collection),
            'students': export_collection_payload(collection),
        }))

    def post(self, request, collection_id, action):
        collection = get_object_or_404(CandidateCollection, pk=collection_id)
        if action == 'add-student':
            from apps.accounts_et_roles.models import StudentProfile
            student = get_object_or_404(StudentProfile, pk=request.data.get('student_profile_id'))
            add_student_to_collection(collection=collection, student=student, actor=request.user, notes=request.data.get('notes', ''))
        elif action == 'remove-student':
            from apps.accounts_et_roles.models import StudentProfile
            student = get_object_or_404(StudentProfile, pk=request.data.get('student_profile_id'))
            remove_student_from_collection(collection=collection, student=student, actor=request.user)
        elif action == 'export':
            return Response(envelope(True, 'Export ready', data=export_collection_payload(collection)))
        else:
            return Response(envelope(False, f'Unknown action: {action}'), status=400)
        return Response(envelope(True, f'Action {action} applied'))


class PipelineBoardView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request):
        offer_uuid = request.query_params.get('offer_uuid')
        offer_id = None
        if offer_uuid:
            offer_id = InternshipOffer.objects.filter(uuid=offer_uuid).values_list('pk', flat=True).first()
        seed_default_pipeline_columns()
        return Response(envelope(True, 'Pipeline loaded', data={
            'board': build_pipeline_board(offer_id=offer_id),
            'metrics': pipeline_metrics(offer_id=offer_id),
        }))


class RecommendationFeedView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        rec_type = request.query_params.get('type')
        feed = get_student_recommendation_feed(request.user.student_profile, rec_type=rec_type)
        return Response(envelope(True, 'Recommendations loaded', data=feed))

    def post(self, request):
        generate_all_recommendations(request.user.student_profile)
        return Response(envelope(True, 'Recommendations refreshed'))


class OfferVersionListView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request, uuid):
        offer = get_object_or_404(InternshipOffer, uuid=uuid)
        versions = list_offer_versions(offer)
        data = [{'version_number': v.version_number, 'change_summary': v.change_summary, 'is_current': v.is_current} for v in versions]
        return Response(envelope(True, 'Versions loaded', data=data))

    def post(self, request, uuid):
        offer = get_object_or_404(InternshipOffer, uuid=uuid)
        version_number = int(request.data.get('version_number', 0))
        try:
            restore_offer_version(offer=offer, version_number=version_number, actor=request.user)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=400)
        return Response(envelope(True, 'Version restored'))


class WebhookSubscriptionView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = STAGE_MANAGE_PERMISSION

    def get(self, request):
        subs = WebhookSubscription.objects.filter(is_active=True)
        return Response(envelope(True, 'Webhooks loaded', data={
            'supported_events': SUPPORTED_WEBHOOK_EVENTS,
            'subscriptions': [{'uuid': str(s.uuid), 'name': s.name, 'target_url': s.target_url} for s in subs],
        }))

    def post(self, request):
        sub = WebhookSubscription.objects.create(
            name=request.data.get('name', 'Webhook'),
            target_url=request.data['target_url'],
            event_types=request.data.get('event_types', SUPPORTED_WEBHOOK_EVENTS),
            secret=request.data.get('secret', ''),
            created_by=request.user,
        )
        return Response(envelope(True, 'Subscription created', data={'uuid': str(sub.uuid)}), status=201)


class OfferChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, uuid):
        from apps.accounts_et_roles.models import StudentProfile
        from apps.stage.services.permissions import user_can_access_chat

        if not user_can_access_chat(request.user):
            return Response(envelope(False, 'Chat access denied'), status=403)

        offer = get_object_or_404(InternshipOffer, uuid=uuid)
        if request.user.role == 'STUDENT':
            student = request.user.student_profile
            admin_users: list = []
        else:
            student = get_object_or_404(StudentProfile, pk=request.data.get('student_profile_id'))
            admin_users = [request.user]

        conv = get_or_create_offer_conversation(
            offer=offer,
            student=student,
            admin_users=admin_users,
            created_by=request.user,
        )
        message_body = (request.data.get('message') or '').strip()
        if message_body:
            send_offer_message(conversation=conv, sender=request.user, body=message_body)
        return Response(envelope(True, 'Conversation ready', data={
            'conversation_id': conv.pk,
            'unread_total': total_unread_for_user(request.user),
        }))
