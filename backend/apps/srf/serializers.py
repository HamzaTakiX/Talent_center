"""DRF serializers for SRF compliance API."""

from rest_framework import serializers

from apps.accounts_et_roles.models import StudentProfile
from apps.srf.compliance_models import (
    FinancialRiskAlert,
    Installment,
    PaymentProofSubmission,
    ProgramExamPeriod,
    StudentAcademicAccess,
)
from apps.srf.models import FinancialAccount


class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = [
            'id', 'installment_number', 'label', 'amount', 'paid_amount', 'currency',
            'due_date', 'semester', 'academic_year', 'payment_status',
            'validated_at', 'validated_by', 'uploaded_receipt',
        ]
        read_only_fields = ['validated_at', 'validated_by']


class FinancialAccountSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    installments = InstallmentSerializer(many=True, read_only=True)

    class Meta:
        model = FinancialAccount
        fields = [
            'id', 'account_number', 'student_profile', 'student_name', 'student_email',
            'class_name', 'payment_plan_type', 'financial_status',
            'total_amount', 'paid_amount', 'remaining_amount', 'currency',
            'current_academic_year', 'balance', 'status', 'last_payment_at',
            'installments',
        ]

    def get_student_name(self, obj) -> str:
        sp = obj.student_profile
        profile = getattr(sp.user, 'profile', None)
        if profile:
            return f'{profile.first_name} {profile.last_name}'.strip() or sp.user.email
        return sp.user.email

    def get_student_email(self, obj) -> str:
        return obj.student_profile.user.email

    def get_class_name(self, obj) -> str:
        cg = obj.student_profile.class_group
        return cg.name if cg else obj.student_profile.current_class or ''


class StudentFinancialRowSerializer(serializers.Serializer):
    """Row shape matching frontend StudentFinancialTableRow."""

    id = serializers.CharField()
    studentName = serializers.CharField()
    className = serializers.CharField()
    amountDue = serializers.FloatField()
    amountPaid = serializers.FloatField()
    status = serializers.CharField()
    financialStatus = serializers.CharField(required=False)
    paymentPlanType = serializers.CharField(required=False)
    canTakeExams = serializers.BooleanField(required=False)
    canDownloadConvention = serializers.BooleanField(required=False)


class PaymentProofSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    proof_file_url = serializers.SerializerMethodField()
    linked_payment_id = serializers.IntegerField(read_only=True)
    audit_timeline = serializers.SerializerMethodField()

    class Meta:
        model = PaymentProofSubmission
        fields = [
            'id', 'uuid', 'account', 'installment', 'amount', 'currency',
            'reference_number', 'proof_file', 'proof_file_url', 'status',
            'submitted_by', 'reviewed_by', 'reviewed_at',
            'rejection_reason', 'admin_notes', 'student_name', 'created_at',
            'linked_payment_id', 'audit_timeline',
        ]
        read_only_fields = [
            'uuid', 'reviewed_by', 'reviewed_at', 'linked_payment', 'created_at',
        ]

    def get_audit_timeline(self, obj) -> list:
        return (obj.metadata_json or {}).get('audit_timeline') or []

    def get_student_name(self, obj) -> str:
        sp = obj.account.student_profile
        profile = getattr(sp.user, 'profile', None)
        if profile:
            return f'{profile.first_name} {profile.last_name}'.strip()
        return sp.user.email

    def get_proof_file_url(self, obj) -> str:
        request = self.context.get('request')
        if obj.proof_file and request:
            return request.build_absolute_uri(obj.proof_file.url)
        if obj.proof_file:
            return obj.proof_file.url
        return ''


class PaymentProofReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=PaymentProofSubmission.Status.choices)
    rejection_reason = serializers.CharField(required=False, allow_blank=True, default='')
    admin_notes = serializers.CharField(required=False, allow_blank=True, default='')
    approved_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        status = attrs.get('status')
        if status == PaymentProofSubmission.Status.REJECTED:
            reason = (attrs.get('rejection_reason') or '').strip()
            if not reason:
                raise serializers.ValidationError({
                    'rejection_reason': 'Rejection reason is required when rejecting a payment.',
                })
        if status == PaymentProofSubmission.Status.APPROVED:
            approved = attrs.get('approved_amount')
            if approved is not None and approved <= 0:
                raise serializers.ValidationError({
                    'approved_amount': 'Approved amount must be greater than zero.',
                })
        return attrs


class ProgramExamPeriodSerializer(serializers.ModelSerializer):
    filiere_code = serializers.CharField(source='filiere.code', read_only=True)
    academic_year_code = serializers.CharField(source='academic_year.code', read_only=True)
    academic_level_code = serializers.CharField(
        source='academic_level.code',
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = ProgramExamPeriod
        fields = [
            'id', 'filiere', 'filiere_code', 'academic_level', 'academic_level_code',
            'academic_year', 'academic_year_code', 'semester',
            'exam_start', 'exam_end', 'convention_block_date', 'payment_deadline',
            'warning_days_before', 'is_active', 'notes',
        ]


class StudentAcademicAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAcademicAccess
        fields = [
            'can_take_exams', 'can_download_convention', 'internship_eligible',
            'financial_clearance', 'blocking_reasons', 'required_semester', 'computed_at',
        ]


class FinancialRiskAlertSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = FinancialRiskAlert
        fields = [
            'id', 'student_profile', 'student_name', 'alert_type', 'severity',
            'title', 'message', 'is_resolved', 'created_at', 'metadata_json',
        ]

    def get_student_name(self, obj) -> str:
        sp = obj.student_profile
        profile = getattr(sp.user, 'profile', None)
        if profile:
            return f'{profile.first_name} {profile.last_name}'.strip()
        return sp.user.email


class SetupInstallmentPlanSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    academic_year = serializers.CharField(max_length=16)
    tranches = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )


class SubmitPaymentProofSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    reference_number = serializers.CharField(required=False, allow_blank=True, default='')
    installment_id = serializers.IntegerField(required=False, allow_null=True)
    proof_file = serializers.FileField()


def account_to_table_row(account: FinancialAccount) -> dict:
    """Map FinancialAccount → frontend table row status."""
    status_map = {
        'CLEAR': 'Paid',
        'PARTIAL': 'Partially Paid',
        'OVERDUE': 'Late',
        'BLOCKED': 'Late',
        'AT_RISK': 'Late',
        'PENDING_VALIDATION': 'Pending Validation',
    }
    fs = account.financial_status
    ui_status = status_map.get(fs, 'Unpaid')
    if fs == 'OVERDUE' or (account.remaining_amount > 0 and account.paid_amount == 0):
        ui_status = 'Unpaid' if account.paid_amount == 0 and fs != 'PENDING_VALIDATION' else ui_status

    sp = account.student_profile
    profile = getattr(sp.user, 'profile', None)
    name = sp.user.email
    if profile:
        name = f'{profile.first_name} {profile.last_name}'.strip() or name
    cg = sp.class_group
    access = getattr(sp, 'academic_access', None)

    pending_proof = (
        account.payment_proofs.filter(
            status__in=[
                PaymentProofSubmission.Status.PENDING,
                PaymentProofSubmission.Status.UNDER_REVIEW,
                PaymentProofSubmission.Status.REQUIRES_CORRECTION,
            ],
        )
        .order_by('-created_at')
        .first()
    )

    return {
        'id': str(account.pk),
        'studentName': name,
        'className': cg.name if cg else sp.current_class or '',
        'amountDue': float(account.total_amount),
        'amountPaid': float(account.paid_amount),
        'status': ui_status,
        'financialStatus': fs,
        'paymentPlanType': account.payment_plan_type,
        'canTakeExams': access.can_take_exams if access else False,
        'canDownloadConvention': access.can_download_convention if access else False,
        'pendingProofId': pending_proof.pk if pending_proof else None,
    }
