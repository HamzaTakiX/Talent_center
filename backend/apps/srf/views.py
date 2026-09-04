"""SRF REST API — financial compliance, validation queues, academic access."""

from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts_et_roles.models import StudentProfile
from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.authentication.utils import envelope
from apps.srf.compliance_models import (
    FinancialRiskAlert,
    PaymentProofSubmission,
    ProgramExamPeriod,
)
from apps.srf.models import FinancialAccount
from apps.srf.serializers import (
    FinancialAccountSerializer,
    FinancialRiskAlertSerializer,
    PaymentProofReviewSerializer,
    PaymentProofSubmissionSerializer,
    ProgramExamPeriodSerializer,
    SetupInstallmentPlanSerializer,
    SubmitPaymentProofSerializer,
    account_to_table_row,
)
from apps.srf.services.academic_access import get_student_access, recompute_academic_access
from apps.srf.services.analytics import (
    build_installment_completion_rate,
    build_payments_by_program,
    build_srf_dashboard_summary,
    build_srf_kpi_cards,
)
from apps.srf.services.financial_profile import (
    ensure_financial_account,
    refresh_student_financial_state,
    setup_installment_plan,
)
from apps.srf.services.payment_validation import review_payment_proof, submit_payment_proof
from apps.srf.services.srf_detail import build_payment_proof_detail, build_student_financial_detail
from apps.srf.services.risk_detection import scan_exam_period_risks, scan_overdue_installments
from apps.srf.services import chat_service as srf_chat_service


class SrfFinancePermission(EffectiveHasPermission):
    """Finance admins and super admins."""

    def has_permission(self, request, view) -> bool:
        view.required_permission = 'finance.manage'
        return super().has_permission(request, view)


# ---------------------------------------------------------------------------
# Dashboard & queues
# ---------------------------------------------------------------------------

class SrfDashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        academic_year = request.query_params.get('academic_year', '')
        data = build_srf_dashboard_summary(academic_year)
        return Response(envelope(True, 'OK', data=data))


class SrfKpiCardsView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        academic_year = request.query_params.get('academic_year', '')
        data = build_srf_kpi_cards(academic_year)
        return Response(envelope(True, 'OK', data=data))


class SrfAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        academic_year = request.query_params.get('academic_year', '')
        data = {
            'summary': build_srf_dashboard_summary(academic_year),
            'payments_by_program': build_payments_by_program(academic_year),
            'installment_completion': build_installment_completion_rate(academic_year),
        }
        return Response(envelope(True, 'OK', data=data))


class SrfStudentFinancialListView(APIView):
    """Main SRF table — all student financial rows."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        academic_year = request.query_params.get('academic_year', '')
        financial_status = request.query_params.get('financial_status', '')
        queue = request.query_params.get('queue', '')

        qs = FinancialAccount.objects.select_related(
            'student_profile__user',
            'student_profile__user__profile',
            'student_profile__class_group',
            'student_profile__academic_access',
        ).prefetch_related('installments')

        if academic_year:
            qs = qs.filter(current_academic_year=academic_year)
        if financial_status:
            qs = qs.filter(financial_status=financial_status)

        if queue == 'pending_validation':
            ids = PaymentProofSubmission.objects.filter(
                status__in=[
                    PaymentProofSubmission.Status.PENDING,
                    PaymentProofSubmission.Status.UNDER_REVIEW,
                ],
            ).values_list('account_id', flat=True)
            qs = qs.filter(pk__in=ids)
        elif queue == 'blocked_exams':
            qs = qs.filter(student_profile__academic_access__can_take_exams=False)
        elif queue == 'convention_restricted':
            qs = qs.filter(student_profile__academic_access__can_download_convention=False)
        elif queue == 'overdue':
            qs = qs.filter(financial_status='OVERDUE')
        elif queue == 'at_risk':
            qs = qs.filter(financial_status='AT_RISK')
        elif queue == 'paid':
            qs = qs.filter(financial_status='CLEAR')
        elif queue == 'partial':
            qs = qs.filter(financial_status='PARTIAL')
        elif queue == 'unpaid':
            qs = qs.filter(financial_status='OVERDUE', paid_amount=0)
        elif queue == 'exempted':
            qs = qs.filter(adjustments__is_active=True).distinct()

        rows = [account_to_table_row(a, request) for a in qs[:500]]
        return Response(envelope(True, 'OK', data={'rows': rows, 'count': len(rows)}))


class SrfStudentFinancialDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request, account_id: int):
        try:
            account = FinancialAccount.objects.select_related(
                'student_profile__user',
                'student_profile__user__profile',
                'student_profile__class_group',
                'student_profile__filiere',
                'student_profile__academic_level',
            ).prefetch_related(
                'installments',
                'payment_proofs',
                'payments',
            ).get(pk=account_id)
        except FinancialAccount.DoesNotExist:
            return Response(envelope(False, 'Account not found'), status=status.HTTP_404_NOT_FOUND)

        data = build_student_financial_detail(account, request)
        return Response(envelope(True, 'OK', data=data))


class SrfMyFinancialDetailView(APIView):
    """Student-facing SRF detail for the authenticated account."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'student_profile'):
            return Response(envelope(False, 'Students only'), status=status.HTTP_403_FORBIDDEN)

        student = request.user.student_profile
        account = ensure_financial_account(student)
        account = FinancialAccount.objects.select_related(
            'student_profile__user',
            'student_profile__user__profile',
            'student_profile__class_group',
            'student_profile__filiere',
            'student_profile__academic_level',
        ).prefetch_related(
            'installments',
            'payment_proofs',
            'payments',
        ).get(pk=account.pk)

        data = build_student_financial_detail(account, request)
        return Response(envelope(True, 'OK', data=data))


class SrfStudentChatView(APIView):
    """Open or continue the student's SRF financial support thread."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'student_profile'):
            return Response(envelope(False, 'Students only'), status=status.HTTP_403_FORBIDDEN)

        student = request.user.student_profile
        conv = srf_chat_service.get_or_create_srf_conversation(
            student=student,
            created_by=request.user,
            request=request,
        )
        message_body = (request.data.get('message') or '').strip()
        if message_body:
            srf_chat_service.send_srf_message(
                conversation=conv,
                sender=request.user,
                body=message_body,
            )
        return Response(
            envelope(True, 'Conversation ready', data={'conversation_id': conv.pk}),
            status=status.HTTP_200_OK,
        )


class SrfAdminChatOpenView(APIView):
    """Open or continue an admin ↔ student SRF financial support thread."""

    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def post(self, request, account_id: int):
        account = (
            FinancialAccount.objects.select_related('student_profile__user')
            .filter(pk=account_id)
            .first()
        )
        if account is None:
            return Response(envelope(False, 'Account not found'), status=status.HTTP_404_NOT_FOUND)

        student = account.student_profile
        if not student or not student.user_id:
            return Response(
                envelope(False, 'Student profile not found'),
                status=status.HTTP_400_BAD_REQUEST,
            )

        conv = srf_chat_service.get_or_create_srf_conversation(
            student=student,
            admin_users=[request.user],
            created_by=request.user,
            request=request,
        )
        meta = conv.metadata_json or {}
        if meta.get('admin_inbox_archived'):
            srf_chat_service.unarchive_srf_conversation(conv, request.user)
        if conv.is_archived:
            srf_chat_service.unarchive_student_srf_conversation(conv, request.user)

        message_body = (request.data.get('message') or '').strip()
        if message_body:
            srf_chat_service.send_srf_message(
                conversation=conv,
                sender=request.user,
                body=message_body,
            )
        return Response(
            envelope(True, 'Conversation ready', data={'conversation_id': conv.pk}),
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Payment validation queue
# ---------------------------------------------------------------------------

class SrfPaymentProofQueueView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        status_filter = request.query_params.get('status', '')
        qs = PaymentProofSubmission.objects.select_related(
            'account__student_profile__user',
        ).order_by('-created_at')
        if status_filter:
            qs = qs.filter(status=status_filter)
        else:
            qs = qs.filter(
                status__in=[
                    PaymentProofSubmission.Status.PENDING,
                    PaymentProofSubmission.Status.UNDER_REVIEW,
                ],
            )
        data = PaymentProofSubmissionSerializer(qs[:200], many=True, context={'request': request}).data
        return Response(envelope(True, 'OK', data=data))


class SrfPaymentProofDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request, proof_id: int):
        data = build_payment_proof_detail(proof_id, request)
        if data is None:
            return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
        return Response(envelope(True, 'OK', data=data))


class SrfPaymentProofReviewView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def post(self, request, proof_id: int):
        try:
            submission = PaymentProofSubmission.objects.get(pk=proof_id)
        except PaymentProofSubmission.DoesNotExist:
            return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)

        ser = PaymentProofReviewSerializer(data=request.data)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            submission = review_payment_proof(
                submission,
                reviewer=request.user,
                new_status=ser.validated_data['status'],
                rejection_reason=ser.validated_data.get('rejection_reason', ''),
                admin_notes=ser.validated_data.get('admin_notes', ''),
                approved_amount=ser.validated_data.get('approved_amount'),
            )
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=status.HTTP_400_BAD_REQUEST)

        detail = build_payment_proof_detail(proof_id, request)
        return Response(
            envelope(
                True,
                'Review recorded',
                data=detail or PaymentProofSubmissionSerializer(
                    submission,
                    context={'request': request},
                ).data,
            ),
        )


class SrfPaymentProofSubmitView(APIView):
    """Student submits payment proof."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if not hasattr(request.user, 'student_profile'):
            return Response(envelope(False, 'Students only'), status=status.HTTP_403_FORBIDDEN)

        ser = SubmitPaymentProofSerializer(data=request.data)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )

        student = request.user.student_profile
        account = ensure_financial_account(student)
        installment = None
        inst_id = ser.validated_data.get('installment_id')
        if inst_id:
            installment = account.installments.filter(pk=inst_id).first()

        try:
            submission = submit_payment_proof(
                account,
                submitted_by=request.user,
                amount=ser.validated_data['amount'],
                proof_file=ser.validated_data['proof_file'],
                reference_number=ser.validated_data.get('reference_number', ''),
                installment=installment,
            )
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=status.HTTP_400_BAD_REQUEST)

        return Response(
            envelope(
                True,
                'Submitted',
                data=PaymentProofSubmissionSerializer(submission, context={'request': request}).data,
            ),
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Exam periods
# ---------------------------------------------------------------------------

class SrfExamPeriodListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        qs = ProgramExamPeriod.objects.select_related('filiere', 'academic_year')
        filiere_id = request.query_params.get('filiere_id')
        if filiere_id:
            qs = qs.filter(filiere_id=filiere_id)
        data = ProgramExamPeriodSerializer(qs, many=True).data
        return Response(envelope(True, 'OK', data=data))

    def post(self, request):
        ser = ProgramExamPeriodSerializer(data=request.data)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        period = ser.save()
        return Response(
            envelope(True, 'Created', data=ProgramExamPeriodSerializer(period).data),
            status=status.HTTP_201_CREATED,
        )


class SrfExamPeriodDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def patch(self, request, period_id: int):
        try:
            period = ProgramExamPeriod.objects.get(pk=period_id)
        except ProgramExamPeriod.DoesNotExist:
            return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
        ser = ProgramExamPeriodSerializer(period, data=request.data, partial=True)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        period = ser.save()
        return Response(envelope(True, 'Updated', data=ProgramExamPeriodSerializer(period).data))


# ---------------------------------------------------------------------------
# Academic access & risk
# ---------------------------------------------------------------------------

class SrfStudentAccessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id: int = None):
        if student_id:
            if not request.user.is_staff and request.user.role != request.user.RoleChoices.ADMIN:
                return Response(envelope(False, 'Forbidden'), status=status.HTTP_403_FORBIDDEN)
            try:
                student = StudentProfile.objects.get(pk=student_id)
            except StudentProfile.DoesNotExist:
                return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
        else:
            if not hasattr(request.user, 'student_profile'):
                return Response(envelope(False, 'Not a student'), status=status.HTTP_403_FORBIDDEN)
            student = request.user.student_profile

        data = get_student_access(student)
        return Response(envelope(True, 'OK', data=data))


class SrfRiskAlertsView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        resolved = request.query_params.get('resolved', 'false').lower() == 'true'
        qs = FinancialRiskAlert.objects.select_related('student_profile__user').filter(
            is_resolved=resolved,
        )[:200]
        data = FinancialRiskAlertSerializer(qs, many=True).data
        return Response(envelope(True, 'OK', data=data))


class SrfRiskScanView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def post(self, request):
        overdue = scan_overdue_installments()
        exam_stats = scan_exam_period_risks()
        return Response(
            envelope(True, 'Scan complete', data={'overdue_alerts': overdue, **exam_stats}),
        )


class SrfSetupInstallmentPlanView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def post(self, request):
        ser = SetupInstallmentPlanSerializer(data=request.data)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            student = StudentProfile.objects.get(pk=ser.validated_data['student_id'])
        except StudentProfile.DoesNotExist:
            return Response(envelope(False, 'Student not found'), status=status.HTTP_404_NOT_FOUND)

        account = ensure_financial_account(student)
        installments = setup_installment_plan(
            account,
            academic_year=ser.validated_data['academic_year'],
            tranches=ser.validated_data['tranches'],
        )
        refresh_student_financial_state(student)
        return Response(
            envelope(
                True,
                'Installment plan created',
                data={'installment_count': len(installments)},
            ),
        )


class SrfRefreshStudentView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def post(self, request, student_id: int):
        try:
            student = StudentProfile.objects.get(pk=student_id)
        except StudentProfile.DoesNotExist:
            return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
        account = refresh_student_financial_state(student)
        recompute_academic_access(student)
        return Response(
            envelope(
                True,
                'Refreshed',
                data=FinancialAccountSerializer(account, context={'request': request}).data,
            ),
        )
