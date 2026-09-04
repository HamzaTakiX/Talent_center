"""Extended template management endpoints for the Email System."""

from __future__ import annotations

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.permissions import IsSuperAdmin
from apps.authentication.utils import envelope
from apps.notifications.api.email_system_serializers import (
    EmailTemplateCreateSerializer,
    EmailTemplateDetailSerializer,
    EmailTemplateDuplicateSerializer,
)
from apps.notifications.events.event_variables import (
    find_unknown_variables,
    get_event_variables,
    get_sample_context,
)
from apps.notifications.events.registry import EVENT_REGISTRY
from apps.notifications.models import NotificationTemplate, NotificationTemplateTranslation
from apps.notifications.models_email_config import EmailSystemAuditLog
from apps.notifications.services.email_config_service import log_email_audit
from apps.notifications.services.email_test_service import send_test_email
from apps.notifications.services.template_resolver import set_default_template, set_selected_template
from apps.notifications.services.template_service import render_notification


class _SuperAdminAPIView(APIView):
    permission_classes = [IsSuperAdmin]


class EmailTemplateCreateView(_SuperAdminAPIView):
    def post(self, request):
        serializer = EmailTemplateCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                envelope(success=False, message='Validation error', errors=serializer.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        data = serializer.validated_data
        if NotificationTemplate.objects.filter(code=data['code']).exists():
            return Response(
                envelope(success=False, message='Template code already exists'),
                status=status.HTTP_400_BAD_REQUEST,
            )
        unknown = find_unknown_variables(
            data['event_code'],
            data['subject_template'],
            data.get('body_html_template', ''),
            data.get('body_text_template', ''),
        )
        if unknown:
            return Response(
                envelope(success=False, message='Unsupported template variables', errors={'variables': unknown}),
                status=status.HTTP_400_BAD_REQUEST,
            )

        tpl = NotificationTemplate.objects.create(
            code=data['code'],
            name=data['name'],
            event_code=data['event_code'],
            channel='EMAIL',
            category=data['category'],
            is_active=True,
            status=NotificationTemplate.Status.ACTIVE,
        )
        NotificationTemplateTranslation.objects.create(
            template=tpl,
            language=data.get('language', 'fr'),
            subject_template=data['subject_template'],
            body_html_template=data.get('body_html_template', ''),
            body_text_template=data.get('body_text_template', ''),
        )
        if data.get('set_as_default'):
            set_default_template(template=tpl)
        if data.get('set_as_selected'):
            set_selected_template(template=tpl)

        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.TEMPLATE,
            field_name=f'create:{tpl.code}',
            new_value=tpl.event_code,
        )
        tpl = NotificationTemplate.objects.filter(pk=tpl.pk).prefetch_related('translations').first()
        return Response(
            envelope(success=True, message='Template created', data=EmailTemplateDetailSerializer(tpl).data),
            status=status.HTTP_201_CREATED,
        )


class EmailTemplateDuplicateView(_SuperAdminAPIView):
    def post(self, request, template_code: str):
        source = (
            NotificationTemplate.objects.filter(code=template_code)
            .prefetch_related('translations')
            .first()
        )
        if not source:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        serializer = EmailTemplateDuplicateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                envelope(success=False, message='Validation error', errors=serializer.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )
        data = serializer.validated_data
        if NotificationTemplate.objects.filter(code=data['new_code']).exists():
            return Response(
                envelope(success=False, message='Template code already exists'),
                status=status.HTTP_400_BAD_REQUEST,
            )
        clone = NotificationTemplate.objects.create(
            code=data['new_code'],
            name=data.get('new_name') or f'{source.name or source.code} (copy)',
            event_code=source.event_code,
            channel=source.channel,
            category=source.category,
            html_file=getattr(source, 'html_file', '') or '',
            default_action_url=getattr(source, 'default_action_url', '') or '',
            metadata_json=dict(getattr(source, 'metadata_json', None) or {}),
            is_active=True,
            status=NotificationTemplate.Status.ACTIVE,
            is_selected=False,
            is_default=False,
        )
        for tr in source.translations.all():
            NotificationTemplateTranslation.objects.create(
                template=clone,
                language=tr.language,
                subject_template=tr.subject_template,
                body_html_template=tr.body_html_template,
                body_text_template=tr.body_text_template,
                in_app_title_template=tr.in_app_title_template,
                in_app_body_template=tr.in_app_body_template,
            )
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.TEMPLATE,
            field_name=f'duplicate:{template_code}',
            new_value=clone.code,
        )
        clone = NotificationTemplate.objects.filter(pk=clone.pk).prefetch_related('translations').first()
        return Response(
            envelope(success=True, message='Template duplicated', data=EmailTemplateDetailSerializer(clone).data),
            status=status.HTTP_201_CREATED,
        )


class EmailTemplateArchiveView(_SuperAdminAPIView):
    def post(self, request, template_code: str):
        tpl = NotificationTemplate.objects.filter(code=template_code).first()
        if not tpl:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        tpl.status = NotificationTemplate.Status.ARCHIVED
        tpl.is_active = False
        tpl.is_selected = False
        tpl.save()
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.TEMPLATE,
            field_name=f'archive:{template_code}',
            new_value='archived',
        )
        detail = NotificationTemplate.objects.filter(pk=tpl.pk).prefetch_related('translations').first()
        return Response(
            envelope(success=True, message='Template archived', data=EmailTemplateDetailSerializer(detail).data)
        )


class EmailTemplateSetSelectedView(_SuperAdminAPIView):
    def post(self, request, template_code: str):
        tpl = NotificationTemplate.objects.filter(code=template_code).first()
        if not tpl:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        try:
            set_selected_template(template=tpl)
        except ValueError as exc:
            return Response(envelope(success=False, message=str(exc)), status=status.HTTP_400_BAD_REQUEST)
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.TEMPLATE,
            field_name=f'select:{template_code}',
            new_value=tpl.event_code,
        )
        detail = NotificationTemplate.objects.filter(pk=tpl.pk).prefetch_related('translations').first()
        return Response(
            envelope(success=True, message='Template selected', data=EmailTemplateDetailSerializer(detail).data)
        )


class EmailTemplateSetDefaultView(_SuperAdminAPIView):
    def post(self, request, template_code: str):
        tpl = NotificationTemplate.objects.filter(code=template_code).first()
        if not tpl:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        try:
            set_default_template(template=tpl)
        except ValueError as exc:
            return Response(envelope(success=False, message=str(exc)), status=status.HTTP_400_BAD_REQUEST)
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.TEMPLATE,
            field_name=f'default:{template_code}',
            new_value=tpl.event_code,
        )
        detail = NotificationTemplate.objects.filter(pk=tpl.pk).prefetch_related('translations').first()
        return Response(
            envelope(success=True, message='Template set as default', data=EmailTemplateDetailSerializer(detail).data)
        )


class EmailEventCatalogView(_SuperAdminAPIView):
    def get(self, request):
        items = []
        for code, cfg in sorted(EVENT_REGISTRY.items()):
            items.append({
                'event_code': code,
                'category': cfg.category,
                'priority': cfg.priority,
                'template_code': cfg.template_code,
                'channels': list(cfg.channels),
                'email_kind': getattr(cfg, 'email_kind', 'NOTIFICATION'),
                'variables': get_event_variables(code),
            })
        return Response(envelope(success=True, message='Event catalog', data={'items': items}))


class EmailEventVariablesView(_SuperAdminAPIView):
    def get(self, request, event_code: str):
        return Response(envelope(
            success=True,
            message='Event variables',
            data={
                'event_code': event_code,
                'variables': get_event_variables(event_code),
                'sample_context': get_sample_context(event_code),
            },
        ))


class EmailTemplateSafePreviewView(_SuperAdminAPIView):
    def post(self, request, template_code: str):
        language = request.data.get('language', 'fr')
        tpl = NotificationTemplate.objects.filter(code=template_code).first()
        if not tpl:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        context = get_sample_context(tpl.event_code or '')
        context.update(request.data.get('context') or {})
        rendered = render_notification(
            template_code=template_code,
            channel='EMAIL',
            language=language,
            context=context,
        )
        return Response(envelope(success=True, message='Preview', data={
            'subject': rendered.subject,
            'body_html': rendered.body_html,
            'body_text': rendered.body_text,
            'event_code': tpl.event_code,
            'is_test_preview': True,
        }))


class EmailTemplateSafeTestView(_SuperAdminAPIView):
    def post(self, request, template_code: str):
        recipient = request.data.get('recipient_email') or request.data.get('to')
        language = request.data.get('language', 'fr')
        if not recipient:
            return Response(
                envelope(success=False, message='recipient_email is required'),
                status=status.HTTP_400_BAD_REQUEST,
            )
        tpl = NotificationTemplate.objects.filter(code=template_code).first()
        if not tpl:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        context = get_sample_context(tpl.event_code or '')
        context['user_email'] = recipient
        rendered = render_notification(
            template_code=template_code,
            channel='EMAIL',
            language=language,
            context=context,
        )
        subject = f'[TEST] {rendered.subject}'
        body_html = (
            '<div style="padding:8px;background:#fff3cd;border:1px solid #ffecb5;'
            'margin-bottom:12px;font-family:sans-serif;font-size:13px;">'
            'This is a test email from the Email System admin. '
            'It does not represent a real business notification.</div>'
            + (rendered.body_html or '')
        )
        ok, message, details = send_test_email(
            to=recipient,
            subject=subject,
            body_html=body_html,
            body_text=f'[TEST] {rendered.body_text or rendered.subject}',
        )
        details = {**(details or {}), 'is_test': True, 'business_event_emitted': False}
        return Response(
            envelope(success=ok, message=message, data=details),
            status=status.HTTP_200_OK if ok else status.HTTP_400_BAD_REQUEST,
        )
