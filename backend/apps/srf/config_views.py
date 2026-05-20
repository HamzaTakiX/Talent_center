"""REST API for SRF Notifications & Exam Configuration workspace."""

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.permissions import IsPlatformAdmin
from apps.authentication.utils import envelope
from apps.srf.compliance_models import ProgramExamPeriod
from apps.srf.config_models import SrfConfigAuditLog, SrfNotificationTemplate, SrfWarningTier
from apps.srf.config_serializers import (
    ProgramExamPeriodConfigSerializer,
    SimulationSerializer,
    SrfConfigAuditLogSerializer,
    SrfNotificationTemplateSerializer,
    SrfRestrictionPolicySerializer,
    SrfWarningTierSerializer,
    TemplatePreviewSerializer,
)
from apps.srf.services.config_audit import get_client_meta, log_config_change
from apps.srf.services.config_engine import (
    build_workspace_analytics,
    get_or_create_restriction_policy,
    render_template,
    seed_default_templates,
    seed_default_warning_tiers,
    simulate_warning_flow,
)
from apps.srf.views import SrfFinancePermission


def _audit(request, *, action: str, entity_type: str, entity_id='', message='', before=None, after=None):
    meta = get_client_meta(request)
    log_config_change(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        actor=request.user,
        ip_address=meta.get('ip_address'),
        user_agent=meta.get('user_agent', ''),
        message=message,
        before=before,
        after=after,
    )


class SrfConfigWorkspaceView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        seed_default_warning_tiers()
        seed_default_templates()
        policy = get_or_create_restriction_policy()
        periods = ProgramExamPeriod.objects.select_related(
            'filiere', 'academic_year', 'academic_level',
        ).order_by('-exam_start')[:100]
        return Response(
            envelope(
                True,
                'OK',
                data={
                    'analytics': build_workspace_analytics(),
                    'restriction_policy': SrfRestrictionPolicySerializer(policy).data,
                    'warning_tiers': SrfWarningTierSerializer(
                        SrfWarningTier.objects.all(),
                        many=True,
                    ).data,
                    'templates': SrfNotificationTemplateSerializer(
                        SrfNotificationTemplate.objects.all(),
                        many=True,
                    ).data,
                    'exam_periods': ProgramExamPeriodConfigSerializer(periods, many=True).data,
                },
            ),
        )


class SrfWarningTierListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        data = SrfWarningTierSerializer(SrfWarningTier.objects.all(), many=True).data
        return Response(envelope(True, 'OK', data=data))

    def post(self, request):
        ser = SrfWarningTierSerializer(data=request.data)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        tier = ser.save()
        _audit(
            request,
            action='CREATE',
            entity_type='warning_tier',
            entity_id=tier.pk,
            message=f'Created warning tier {tier.label}',
            after=ser.data,
        )
        return Response(
            envelope(True, 'Created', data=SrfWarningTierSerializer(tier).data),
            status=status.HTTP_201_CREATED,
        )


class SrfWarningTierDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def patch(self, request, tier_id: int):
        try:
            tier = SrfWarningTier.objects.get(pk=tier_id)
        except SrfWarningTier.DoesNotExist:
            return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
        before = SrfWarningTierSerializer(tier).data
        ser = SrfWarningTierSerializer(tier, data=request.data, partial=True)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        tier = ser.save()
        _audit(
            request,
            action='UPDATE',
            entity_type='warning_tier',
            entity_id=tier.pk,
            message=f'Updated warning tier {tier.label}',
            before=before,
            after=ser.data,
        )
        return Response(envelope(True, 'Updated', data=ser.data))

    def delete(self, request, tier_id: int):
        try:
            tier = SrfWarningTier.objects.get(pk=tier_id)
        except SrfWarningTier.DoesNotExist:
            return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
        before = SrfWarningTierSerializer(tier).data
        label = tier.label
        tier.delete()
        _audit(
            request,
            action='DELETE',
            entity_type='warning_tier',
            entity_id=tier_id,
            message=f'Deleted warning tier {label}',
            before=before,
        )
        return Response(envelope(True, 'Deleted'))


class SrfRestrictionPolicyView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        policy = get_or_create_restriction_policy()
        return Response(envelope(True, 'OK', data=SrfRestrictionPolicySerializer(policy).data))

    def put(self, request):
        policy = get_or_create_restriction_policy()
        before = SrfRestrictionPolicySerializer(policy).data
        ser = SrfRestrictionPolicySerializer(policy, data=request.data, partial=True)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        policy = ser.save()
        _audit(
            request,
            action='UPDATE',
            entity_type='restriction_policy',
            entity_id=policy.pk,
            message='Updated SRF restriction policy',
            before=before,
            after=ser.data,
        )
        return Response(envelope(True, 'Updated', data=ser.data))


class SrfNotificationTemplateListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def post(self, request):
        ser = SrfNotificationTemplateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        tpl = ser.save()
        _audit(
            request,
            action='CREATE',
            entity_type='notification_template',
            entity_id=tpl.pk,
            message=f'Created template {tpl.code}',
            after=ser.data,
        )
        return Response(
            envelope(True, 'Created', data=ser.data),
            status=status.HTTP_201_CREATED,
        )


class SrfNotificationTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def patch(self, request, template_id: int):
        try:
            tpl = SrfNotificationTemplate.objects.get(pk=template_id)
        except SrfNotificationTemplate.DoesNotExist:
            return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
        before = SrfNotificationTemplateSerializer(tpl).data
        ser = SrfNotificationTemplateSerializer(tpl, data=request.data, partial=True)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        tpl = ser.save()
        _audit(
            request,
            action='UPDATE',
            entity_type='notification_template',
            entity_id=tpl.pk,
            message=f'Updated template {tpl.code}',
            before=before,
            after=ser.data,
        )
        return Response(envelope(True, 'Updated', data=ser.data))


class SrfConfigExamPeriodListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def post(self, request):
        ser = ProgramExamPeriodConfigSerializer(data=request.data)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        period = ser.save()
        period = ProgramExamPeriod.objects.select_related(
            'filiere', 'academic_year', 'academic_level',
        ).get(pk=period.pk)
        data = ProgramExamPeriodConfigSerializer(period).data
        _audit(
            request,
            action='CREATE',
            entity_type='exam_period',
            entity_id=period.pk,
            message=f'Created exam period {period}',
            after=data,
        )
        return Response(
            envelope(True, 'Created', data=data),
            status=status.HTTP_201_CREATED,
        )


class SrfConfigExamPeriodDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def patch(self, request, period_id: int):
        try:
            period = ProgramExamPeriod.objects.select_related(
                'filiere', 'academic_year', 'academic_level',
            ).get(pk=period_id)
        except ProgramExamPeriod.DoesNotExist:
            return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
        before = ProgramExamPeriodConfigSerializer(period).data
        ser = ProgramExamPeriodConfigSerializer(period, data=request.data, partial=True)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        period = ser.save()
        _audit(
            request,
            action='UPDATE',
            entity_type='exam_period',
            entity_id=period.pk,
            message=f'Updated exam period {period}',
            before=before,
            after=ser.data,
        )
        return Response(envelope(True, 'Updated', data=ser.data))

    def delete(self, request, period_id: int):
        try:
            period = ProgramExamPeriod.objects.get(pk=period_id)
        except ProgramExamPeriod.DoesNotExist:
            return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
        before = ProgramExamPeriodConfigSerializer(period).data
        period.delete()
        _audit(
            request,
            action='DELETE',
            entity_type='exam_period',
            entity_id=period_id,
            message='Deleted exam period',
            before=before,
        )
        return Response(envelope(True, 'Deleted'))


class SrfConfigAuditLogView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def get(self, request):
        qs = SrfConfigAuditLog.objects.select_related('actor')[:100]
        data = SrfConfigAuditLogSerializer(qs, many=True).data
        return Response(envelope(True, 'OK', data=data))


class SrfConfigSimulateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def post(self, request):
        ser = SimulationSerializer(data=request.data)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        result = simulate_warning_flow(**ser.validated_data)
        return Response(envelope(True, 'OK', data=result))


class SrfConfigTemplatePreviewView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, SrfFinancePermission]

    def post(self, request):
        ser = TemplatePreviewSerializer(data=request.data)
        if not ser.is_valid():
            return Response(
                envelope(False, 'Invalid data', errors=ser.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        data = ser.validated_data
        variables = data.get('variables') or {}
        if data.get('template_id'):
            try:
                tpl = SrfNotificationTemplate.objects.get(pk=data['template_id'])
            except SrfNotificationTemplate.DoesNotExist:
                return Response(envelope(False, 'Not found'), status=status.HTTP_404_NOT_FOUND)
            subject = tpl.subject_template
            body = tpl.body_template
        else:
            subject = data.get('subject_template', '')
            body = data.get('body_template', '')
        return Response(
            envelope(
                True,
                'OK',
                data={
                    'subject': render_template(subject, variables),
                    'body': render_template(body, variables),
                },
            ),
        )
