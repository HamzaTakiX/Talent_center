"""REST API views for internship offers module."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts_et_roles.permissions import IsStudent
from apps.admin_management.pagination import paginate_queryset, paginated_payload
from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.authentication.utils import envelope

from .models import InternshipOffer, OfferApplication, OfferImportJob, StudentOfferMatchScore
from .permissions import CanManageInternshipOffers, STAGE_MANAGE_PERMISSION
from .serializers import (
    ApplySerializer,
    ApplicationActionSerializer,
    ImportApproveSerializer,
    ImportUrlSerializer,
    InternshipOfferDetailSerializer,
    InternshipOfferListSerializer,
    InternshipOfferWriteSerializer,
    MatchScoreSerializer,
    OfferApplicationSerializer,
    OfferTargetingSelectionSerializer,
    OfferImportJobSerializer,
)
from .services.analytics import full_analytics_dashboard
from .services.application_service import (
    accept_application,
    apply_to_offer,
    mark_internship_completed,
    mark_internship_started,
    reject_application,
    schedule_interview,
    shortlist_application,
    student_accept_offer,
    student_decline_offer,
    withdraw_application,
)
from .services.exceptions import (
    DuplicateOfferError,
    OfferPermissionError,
    OfferTransitionError,
    OfferValidationError,
    StageServiceError,
)
from .services.matching_service import top_matches_for_offer, top_matches_for_student
from .services.offer_import_service import (
    approve_import_and_publish,
    get_import_analytics,
    reject_import,
    run_import_extraction,
    save_import_as_draft,
    start_import_from_url,
)
from .services.offer_lifecycle import PUBLICLY_VISIBLE_STATUSES, STUDENT_APPLYABLE_STATUSES
from .services.offer_service import (
    archive_offer,
    close_offer,
    create_offer_draft,
    increment_view_count,
    publish_offer,
    soft_delete_offer,
    submit_for_review,
    update_offer,
)
from .services.permissions import user_can_manage_offers


def _handle_service_error(exc: StageServiceError) -> Response:
    status_code = status.HTTP_400_BAD_REQUEST
    if isinstance(exc, OfferPermissionError):
        status_code = status.HTTP_403_FORBIDDEN
    elif isinstance(exc, DuplicateOfferError):
        status_code = status.HTTP_409_CONFLICT
    elif isinstance(exc, (OfferTransitionError, OfferValidationError)):
        status_code = status.HTTP_409_CONFLICT
    return Response(
        envelope(False, exc.message, errors={'code': exc.code}),
        status=status_code,
    )


class OfferDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = STAGE_MANAGE_PERMISSION

    def get(self, request):
        return Response(envelope(True, 'Analytics loaded', data=full_analytics_dashboard()))


class OfferListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = InternshipOffer.objects.exclude(status=InternshipOffer.Status.DELETED).select_related(
            'company',
        ).prefetch_related('targeting_rules')
        if not user_can_manage_offers(request.user):
            qs = qs.filter(status__in=list(PUBLICLY_VISIBLE_STATUSES | STUDENT_APPLYABLE_STATUSES))
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        items, meta = paginate_queryset(qs.order_by('-updated_at'), request)
        ser = InternshipOfferListSerializer(items, many=True, context={'request': request})
        return Response(envelope(True, 'Offers loaded', data=paginated_payload(ser.data, meta)))

    def post(self, request):
        if not user_can_manage_offers(request.user):
            return Response(envelope(False, 'Permission denied'), status=403)
        ser = InternshipOfferWriteSerializer(data=request.data)
        if not ser.is_valid():
            return Response(envelope(False, 'Validation error', errors=ser.errors), status=400)
        try:
            offer = create_offer_draft(actor=request.user, data=ser.validated_data)
        except StageServiceError as exc:
            return _handle_service_error(exc)
        return Response(
            envelope(
                True,
                'Draft created',
                data=InternshipOfferDetailSerializer(offer, context={'request': request}).data,
            ),
            status=201,
        )


class OfferDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, uuid):
        return get_object_or_404(
            InternshipOffer.objects.select_related('company').prefetch_related('targeting_rules'),
            uuid=uuid,
        )

    def get(self, request, uuid):
        offer = self._get(uuid)
        if not user_can_manage_offers(request.user) and offer.status not in PUBLICLY_VISIBLE_STATUSES:
            return Response(envelope(False, 'Not found'), status=404)
        if request.user.role == 'STUDENT':
            increment_view_count(offer)
        return Response(
            envelope(
                True,
                'Offer loaded',
                data=InternshipOfferDetailSerializer(offer, context={'request': request}).data,
            ),
        )

    def patch(self, request, uuid):
        if not user_can_manage_offers(request.user):
            return Response(envelope(False, 'Permission denied'), status=403)
        offer = self._get(uuid)
        ser = InternshipOfferWriteSerializer(data=request.data, partial=True)
        if not ser.is_valid():
            return Response(envelope(False, 'Validation error', errors=ser.errors), status=400)
        try:
            offer = update_offer(offer=offer, actor=request.user, data=ser.validated_data)
        except StageServiceError as exc:
            return _handle_service_error(exc)
        return Response(
            envelope(
                True,
                'Offer updated',
                data=InternshipOfferDetailSerializer(offer, context={'request': request}).data,
            ),
        )


class OfferActionView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def post(self, request, uuid, action):
        offer = get_object_or_404(InternshipOffer, uuid=uuid)
        try:
            if action == 'submit-review':
                offer = submit_for_review(offer=offer, actor=request.user)
            elif action == 'publish':
                offer = publish_offer(offer=offer, actor=request.user)
            elif action == 'close':
                offer = close_offer(offer=offer, actor=request.user)
            elif action == 'archive':
                offer = archive_offer(offer=offer, actor=request.user)
            elif action == 'delete':
                offer = soft_delete_offer(offer=offer, actor=request.user)
            elif action == 'targeting-preview':
                from apps.stage.services.targeting_service import (
                    build_targeting_rules_from_selection,
                    preview_offer_targeting,
                )

                ser = OfferTargetingSelectionSerializer(data=request.data)
                if not ser.is_valid():
                    return Response(envelope(False, 'Validation error', errors=ser.errors), status=400)
                payloads = build_targeting_rules_from_selection(**ser.validated_data)
                preview = preview_offer_targeting(offer=offer, rule_payloads=payloads)
                return Response(envelope(True, 'Targeting preview loaded', data=preview))
            else:
                return Response(envelope(False, f'Unknown action: {action}'), status=400)
        except StageServiceError as exc:
            return _handle_service_error(exc)
        return Response(
            envelope(
                True,
                f'Action {action} applied',
                data=InternshipOfferDetailSerializer(offer, context={'request': request}).data,
            ),
        )


class OfferApplicationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, uuid):
        offer = get_object_or_404(InternshipOffer, uuid=uuid)
        if not user_can_manage_offers(request.user):
            return Response(envelope(False, 'Permission denied'), status=403)
        apps = offer.applications.select_related('student_profile__user').order_by('-applied_at')
        ser = OfferApplicationSerializer(apps, many=True)
        return Response(envelope(True, 'Applications loaded', data=ser.data))

    def post(self, request, uuid):
        offer = get_object_or_404(InternshipOffer, uuid=uuid)
        ser = ApplySerializer(data=request.data)
        if not ser.is_valid():
            return Response(envelope(False, 'Validation error', errors=ser.errors), status=400)
        try:
            application = apply_to_offer(
                offer=offer,
                student_user=request.user,
                **ser.validated_data,
            )
        except StageServiceError as exc:
            return _handle_service_error(exc)
        return Response(
            envelope(True, 'Application submitted', data=OfferApplicationSerializer(application).data),
            status=201,
        )


class ApplicationActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, app_uuid, action):
        application = get_object_or_404(
            OfferApplication.objects.select_related('offer', 'student_profile__user'),
            uuid=app_uuid,
        )
        ser = ApplicationActionSerializer(data=request.data)
        ser.is_valid(raise_exception=False)
        data = ser.validated_data if ser.is_valid() else {}
        is_student = application.student_profile.user_id == request.user.pk
        try:
            if action == 'withdraw':
                application = withdraw_application(
                    application=application, student_user=request.user, reason=data.get('reason', ''),
                )
            elif action == 'shortlist':
                application = shortlist_application(
                    application=application, actor=request.user, notes=data.get('notes', ''),
                )
            elif action == 'reject':
                application = reject_application(
                    application=application, actor=request.user, reason=data.get('reason', ''),
                )
            elif action == 'interview':
                application = schedule_interview(
                    application=application,
                    actor=request.user,
                    interview_details=data.get('interview_details') or {},
                )
            elif action == 'accept':
                application = accept_application(
                    application=application, actor=request.user, notes=data.get('notes', ''),
                )
            elif action == 'offer-accept':
                application = student_accept_offer(application=application, student_user=request.user)
            elif action == 'offer-decline':
                application = student_decline_offer(
                    application=application, student_user=request.user, reason=data.get('reason', ''),
                )
            elif action == 'internship-start':
                application = mark_internship_started(application=application, actor=request.user)
            elif action == 'internship-complete':
                application = mark_internship_completed(
                    application=application, actor=request.user, notes=data.get('notes', ''),
                )
            else:
                return Response(envelope(False, f'Unknown action: {action}'), status=400)
        except StageServiceError as exc:
            return _handle_service_error(exc)
        except PermissionError as exc:
            return Response(envelope(False, str(exc)), status=403)
        return Response(
            envelope(True, f'Action {action} applied', data=OfferApplicationSerializer(application).data),
        )


class OfferImportView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request):
        qs = OfferImportJob.objects.select_related(
            'duplicate_offer', 'resulting_offer', 'initiated_by',
        ).prefetch_related('history').order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        items, meta = paginate_queryset(qs, request)
        ser = OfferImportJobSerializer(items, many=True)
        analytics = get_import_analytics()
        return Response(envelope(
            True,
            'Import jobs loaded',
            data={'items': ser.data, 'pagination': meta, 'analytics': analytics},
        ))

    def post(self, request):
        ser = ImportUrlSerializer(data=request.data)
        if not ser.is_valid():
            return Response(envelope(False, 'Validation error', errors=ser.errors), status=400)
        try:
            job = start_import_from_url(actor=request.user, source_url=ser.validated_data['source_url'])
            job = run_import_extraction(job, actor=request.user)
        except StageServiceError as exc:
            return _handle_service_error(exc)
        job = OfferImportJob.objects.select_related(
            'duplicate_offer', 'resulting_offer',
        ).prefetch_related('history').get(pk=job.pk)
        return Response(
            envelope(True, 'Import started', data=OfferImportJobSerializer(job).data),
            status=201,
        )


class OfferImportDetailView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request, job_uuid):
        job = get_object_or_404(
            OfferImportJob.objects.select_related('duplicate_offer', 'resulting_offer').prefetch_related('history'),
            uuid=job_uuid,
        )
        return Response(envelope(True, 'Import job loaded', data=OfferImportJobSerializer(job).data))

    def post(self, request, job_uuid, action):
        job = get_object_or_404(OfferImportJob, uuid=job_uuid)
        skip_duplicate = bool(request.data.get('skip_duplicate_check'))
        try:
            if action == 'approve':
                ser = ImportApproveSerializer(data=request.data)
                ser.is_valid(raise_exception=True)
                offer = approve_import_and_publish(
                    job,
                    actor=request.user,
                    overrides=ser.validated_data.get('overrides'),
                    skip_duplicate_check=skip_duplicate,
                )
                job.refresh_from_db()
                return Response(envelope(
                    True, 'Import published',
                    data={'job': OfferImportJobSerializer(job).data, 'offer_uuid': str(offer.uuid)},
                ))
            if action == 'draft':
                ser = ImportApproveSerializer(data=request.data)
                ser.is_valid(raise_exception=True)
                offer = save_import_as_draft(
                    job,
                    actor=request.user,
                    overrides=ser.validated_data.get('overrides'),
                    skip_duplicate_check=skip_duplicate,
                )
                job.refresh_from_db()
                return Response(envelope(
                    True, 'Import draft saved',
                    data={'job': OfferImportJobSerializer(job).data, 'offer_uuid': str(offer.uuid)},
                ))
            if action == 'reject':
                job = reject_import(job, actor=request.user, reason=request.data.get('reason', ''))
                return Response(envelope(True, 'Import rejected', data=OfferImportJobSerializer(job).data))
        except StageServiceError as exc:
            return _handle_service_error(exc)
        return Response(envelope(False, f'Unknown action: {action}'), status=400)


class StudentMatchesView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        student = request.user.student_profile
        scores = top_matches_for_student(student, limit=int(request.query_params.get('limit', 10)))
        return Response(envelope(True, 'Matches loaded', data=MatchScoreSerializer(scores, many=True).data))


class OfferMatchesView(APIView):
    permission_classes = [IsAuthenticated, CanManageInternshipOffers]

    def get(self, request, uuid):
        offer = get_object_or_404(InternshipOffer, uuid=uuid)
        scores = top_matches_for_offer(offer, limit=int(request.query_params.get('limit', 10)))
        return Response(envelope(True, 'Matches loaded', data=MatchScoreSerializer(scores, many=True).data))
