"""Super Admin email system administration API."""

from __future__ import annotations

from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.permissions import IsSuperAdmin
from apps.authentication.utils import envelope
from apps.notifications.api.email_system_serializers import (
    EmailCategoryConfigSerializer,
    EmailProviderConfigSerializer,
    EmailSenderIdentitySerializer,
    EmailSystemAuditLogSerializer,
    EmailTemplateDetailSerializer,
    EmailTemplateListSerializer,
    EmailTemplateUpdateSerializer,
    EmailTestSendSerializer,
    PlatformAdvancedSettingsSerializer,
    PlatformEmailSettingsSerializer,
)
from apps.notifications.api.serializers import QueueRecipientSerializer
from apps.notifications.models import NotificationRecipient, NotificationTemplate, NotificationTemplateTranslation
from apps.notifications.models_email_config import (
    EmailCategoryConfig,
    EmailProviderConfig,
    EmailSenderIdentity,
    EmailSystemAuditLog,
    PlatformEmailSettings,
)
from apps.notifications.services.analytics_service import (
    get_overview_metrics,
    get_provider_health,
    get_queue_stats,
    get_top_templates,
)
from apps.notifications.services.email_config_service import (
    log_email_audit,
    seed_email_system_defaults,
    track_field_changes,
)
from apps.notifications.services.email_test_service import send_test_email, validate_provider_connection
from apps.notifications.services.queue_service import enqueue_recipient
from apps.notifications.services.template_service import render_notification


class _SuperAdminView(APIView):
    permission_classes = [IsSuperAdmin]


class EmailSystemBootstrapView(_SuperAdminView):
    """Ensure defaults exist and return workspace snapshot."""

    def get(self, request):
        seed_email_system_defaults()
        return Response(envelope(
            success=True,
            message='Email system workspace',
            data={
                'general': PlatformEmailSettingsSerializer(PlatformEmailSettings.get_solo()).data,
                'provider': EmailProviderConfigSerializer(EmailProviderConfig.get_solo()).data,
                'senders_count': EmailSenderIdentity.objects.count(),
                'categories_count': EmailCategoryConfig.objects.count(),
            },
        ))


class EmailGeneralSettingsView(_SuperAdminView):
    def get(self, request):
        seed_email_system_defaults()
        obj = PlatformEmailSettings.get_solo()
        return Response(envelope(
            success=True,
            message='General settings',
            data=PlatformEmailSettingsSerializer(obj).data,
        ))

    def patch(self, request):
        obj = PlatformEmailSettings.get_solo()
        serializer = PlatformEmailSettingsSerializer(obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(envelope(success=False, message='Validation error', errors=serializer.errors),
                            status=status.HTTP_400_BAD_REQUEST)
        track_field_changes(
            user=request.user,
            instance=obj,
            validated_data=serializer.validated_data,
            change_type=EmailSystemAuditLog.ChangeType.GENERAL,
        )
        serializer.save()
        return Response(envelope(success=True, message='Settings saved', data=serializer.data))


class EmailProviderView(_SuperAdminView):
    def get(self, request):
        seed_email_system_defaults()
        obj = EmailProviderConfig.get_solo()
        return Response(envelope(
            success=True,
            message='Provider config',
            data=EmailProviderConfigSerializer(obj).data,
        ))

    def patch(self, request):
        obj = EmailProviderConfig.get_solo()
        data = dict(request.data)
        if not data.get('api_key'):
            data.pop('api_key', None)
        if not data.get('smtp_password'):
            data.pop('smtp_password', None)
        serializer = EmailProviderConfigSerializer(obj, data=data, partial=True)
        if not serializer.is_valid():
            return Response(envelope(success=False, message='Validation error', errors=serializer.errors),
                            status=status.HTTP_400_BAD_REQUEST)
        track_field_changes(
            user=request.user,
            instance=obj,
            validated_data=serializer.validated_data,
            change_type=EmailSystemAuditLog.ChangeType.PROVIDER,
        )
        serializer.save()
        return Response(envelope(success=True, message='Provider updated', data=EmailProviderConfigSerializer(obj).data))


class EmailProviderValidateView(_SuperAdminView):
    def post(self, request):
        ok, message, details = validate_provider_connection()
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.PROVIDER,
            field_name='validate_connection',
            new_value='success' if ok else 'failed',
            metadata=details,
        )
        return Response(envelope(
            success=ok,
            message=message,
            data={'details': details, 'provider': EmailProviderConfigSerializer(EmailProviderConfig.get_solo()).data},
        ), status=status.HTTP_200_OK if ok else status.HTTP_400_BAD_REQUEST)


class EmailProviderConnectView(_SuperAdminView):
    def post(self, request):
        obj = EmailProviderConfig.get_solo()
        obj.is_active = True
        obj.save(update_fields=['is_active', 'updated_at'])
        ok, message, details = validate_provider_connection()
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.PROVIDER,
            field_name='connect',
            new_value=obj.provider,
        )
        return Response(envelope(success=ok, message=message, data={'details': details}))


class EmailProviderDisconnectView(_SuperAdminView):
    def post(self, request):
        obj = EmailProviderConfig.get_solo()
        old = obj.provider
        obj.is_active = False
        obj.status = EmailProviderConfig.Status.DISCONNECTED
        obj.save(update_fields=['is_active', 'status', 'updated_at'])
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.PROVIDER,
            field_name='disconnect',
            old_value=old,
            new_value='disconnected',
        )
        return Response(envelope(success=True, message='Provider disconnected'))


class EmailProviderTestView(_SuperAdminView):
    def post(self, request):
        to = request.data.get('recipient_email') or request.user.email
        ok, message, details = send_test_email(
            to=to,
            subject='Digital Talent Center — Provider test',
            body_html='<p>This is a provider configuration test email.</p>',
            body_text='This is a provider configuration test email.',
        )
        return Response(envelope(success=ok, message=message, data=details),
                        status=status.HTTP_200_OK if ok else status.HTTP_400_BAD_REQUEST)


class EmailSenderListCreateView(_SuperAdminView):
    def get(self, request):
        seed_email_system_defaults()
        qs = EmailSenderIdentity.objects.all()
        module = request.query_params.get('module')
        if module:
            qs = qs.filter(module=module)
        return Response(envelope(
            success=True,
            message='Sender identities',
            data={'items': EmailSenderIdentitySerializer(qs, many=True).data},
        ))

    def post(self, request):
        serializer = EmailSenderIdentitySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(envelope(success=False, message='Validation error', errors=serializer.errors),
                            status=status.HTTP_400_BAD_REQUEST)
        obj = serializer.save()
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.SENDER,
            field_name='create',
            new_value=obj.email_address,
        )
        return Response(envelope(success=True, message='Sender created', data=serializer.data),
                        status=status.HTTP_201_CREATED)


class EmailSenderDetailView(_SuperAdminView):
    def patch(self, request, sender_id: int):
        obj = EmailSenderIdentity.objects.filter(pk=sender_id).first()
        if not obj:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        serializer = EmailSenderIdentitySerializer(obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(envelope(success=False, message='Validation error', errors=serializer.errors),
                            status=status.HTTP_400_BAD_REQUEST)
        track_field_changes(
            user=request.user,
            instance=obj,
            validated_data=serializer.validated_data,
            change_type=EmailSystemAuditLog.ChangeType.SENDER,
        )
        serializer.save()
        return Response(envelope(success=True, message='Sender updated', data=serializer.data))

    def delete(self, request, sender_id: int):
        obj = EmailSenderIdentity.objects.filter(pk=sender_id).first()
        if not obj:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        if obj.is_default:
            return Response(envelope(success=False, message='Cannot delete default sender'),
                            status=status.HTTP_400_BAD_REQUEST)
        email = obj.email_address
        obj.delete()
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.SENDER,
            field_name='delete',
            old_value=email,
        )
        return Response(envelope(success=True, message='Sender deleted'))


class EmailSenderSetDefaultView(_SuperAdminView):
    def post(self, request, sender_id: int):
        obj = EmailSenderIdentity.objects.filter(pk=sender_id).first()
        if not obj:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        EmailSenderIdentity.objects.update(is_default=False)
        obj.is_default = True
        obj.save(update_fields=['is_default', 'updated_at'])
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.SENDER,
            field_name='set_default',
            new_value=obj.email_address,
        )
        return Response(envelope(success=True, message='Default sender set', data=EmailSenderIdentitySerializer(obj).data))


class EmailSenderVerifyView(_SuperAdminView):
    def post(self, request, sender_id: int):
        obj = EmailSenderIdentity.objects.filter(pk=sender_id).first()
        if not obj:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        obj.is_verified = True
        obj.status = EmailSenderIdentity.Status.ACTIVE
        obj.save(update_fields=['is_verified', 'status', 'updated_at'])
        return Response(envelope(success=True, message='Sender verified', data=EmailSenderIdentitySerializer(obj).data))


class EmailCategoryListView(_SuperAdminView):
    def get(self, request):
        seed_email_system_defaults()
        qs = EmailCategoryConfig.objects.all()
        return Response(envelope(
            success=True,
            message='Email categories',
            data={'items': EmailCategoryConfigSerializer(qs, many=True).data},
        ))

    def patch(self, request):
        items = request.data.get('items', [])
        updated = []
        for item in items:
            cat_id = item.get('id')
            obj = EmailCategoryConfig.objects.filter(pk=cat_id).first()
            if not obj:
                continue
            serializer = EmailCategoryConfigSerializer(obj, data=item, partial=True)
            if serializer.is_valid():
                track_field_changes(
                    user=request.user,
                    instance=obj,
                    validated_data=serializer.validated_data,
                    change_type=EmailSystemAuditLog.ChangeType.CATEGORY,
                )
                serializer.save()
                updated.append(serializer.data)
        return Response(envelope(success=True, message='Categories updated', data={'items': updated}))


class EmailTemplateListView(_SuperAdminView):
    def get(self, request):
        channel = request.query_params.get('channel', 'EMAIL')
        qs = NotificationTemplate.objects.filter(channel=channel).prefetch_related('translations')
        return Response(envelope(
            success=True,
            message='Templates',
            data={'items': EmailTemplateListSerializer(qs, many=True).data},
        ))


class EmailTemplateDetailView(_SuperAdminView):
    def get(self, request, template_code: str):
        tpl = NotificationTemplate.objects.filter(code=template_code).prefetch_related('translations').first()
        if not tpl:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        return Response(envelope(
            success=True,
            message='Template detail',
            data=EmailTemplateDetailSerializer(tpl).data,
        ))

    def patch(self, request, template_code: str):
        tpl = NotificationTemplate.objects.filter(code=template_code).first()
        if not tpl:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        serializer = EmailTemplateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(envelope(success=False, message='Validation error', errors=serializer.errors),
                            status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        translation, _ = NotificationTemplateTranslation.objects.get_or_create(
            template=tpl,
            language=data['language'],
            defaults={
                'subject_template': data['subject_template'],
                'body_html_template': data.get('body_html_template', ''),
                'body_text_template': data.get('body_text_template', ''),
            },
        )
        old_subject = translation.subject_template
        translation.subject_template = data['subject_template']
        translation.body_html_template = data.get('body_html_template', translation.body_html_template)
        translation.body_text_template = data.get('body_text_template', translation.body_text_template)
        translation.save()
        log_email_audit(
            user=request.user,
            change_type=EmailSystemAuditLog.ChangeType.TEMPLATE,
            field_name=f'{template_code}:{data["language"]}:subject',
            old_value=old_subject,
            new_value=data['subject_template'],
        )
        return Response(envelope(
            success=True,
            message='Template updated',
            data=EmailTemplateDetailSerializer(
                NotificationTemplate.objects.filter(pk=tpl.pk).prefetch_related('translations').first()
            ).data,
        ))


class EmailTemplatePreviewView(_SuperAdminView):
    def post(self, request, template_code: str):
        language = request.data.get('language', 'fr')
        context = request.data.get('context', {})
        context.setdefault('user_name', request.user.email)
        context.setdefault('user_email', request.user.email)
        try:
            rendered = render_notification(
                template_code=template_code,
                channel='EMAIL',
                language=language,
                context=context,
            )
        except Exception as exc:
            return Response(envelope(success=False, message=str(exc)), status=status.HTTP_400_BAD_REQUEST)
        return Response(envelope(success=True, message='Preview', data={
            'subject': rendered.subject,
            'body_html': rendered.body_html,
            'body_text': rendered.body_text,
        }))


class EmailTemplateTestView(_SuperAdminView):
    def post(self, request, template_code: str):
        serializer = EmailTestSendSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(envelope(success=False, message='Validation error', errors=serializer.errors),
                            status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        if data.get('template_code') or template_code:
            code = template_code or data['template_code']
            context = {'user_name': 'Test User', 'user_email': data['recipient_email']}
            rendered = render_notification(
                template_code=code,
                channel='EMAIL',
                language=data['language'],
                context=context,
            )
            subject, body_html, body_text = rendered.subject, rendered.body_html, rendered.body_text
        else:
            subject = data.get('subject') or 'Test email'
            body_html = data.get('body_html') or '<p>Test</p>'
            body_text = subject
        ok, message, details = send_test_email(
            to=data['recipient_email'],
            subject=subject,
            body_html=body_html,
            body_text=body_text,
        )
        return Response(envelope(success=ok, message=message, data=details),
                        status=status.HTTP_200_OK if ok else status.HTTP_400_BAD_REQUEST)


class EmailAnalyticsOverviewView(_SuperAdminView):
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        metrics = get_overview_metrics(days=days)
        queued = NotificationRecipient.objects.filter(
            delivery_channel=NotificationRecipient.Channel.EMAIL,
            status__in=[
                NotificationRecipient.Status.PENDING,
                NotificationRecipient.Status.QUEUED,
                NotificationRecipient.Status.RETRY_SCHEDULED,
            ],
        ).count()
        metrics['queued'] = queued
        metrics['templates'] = get_top_templates(days=days)
        return Response(envelope(success=True, message='Analytics', data=metrics))


class EmailQueueView(_SuperAdminView):
    def get(self, request):
        status_filter = request.query_params.get('status', '')
        qs = NotificationRecipient.objects.filter(
            delivery_channel=NotificationRecipient.Channel.EMAIL,
        ).select_related('user', 'event').order_by('-created_at')
        if status_filter:
            qs = qs.filter(status=status_filter.upper())
        else:
            qs = qs.filter(status__in=[
                NotificationRecipient.Status.PENDING,
                NotificationRecipient.Status.QUEUED,
                NotificationRecipient.Status.PROCESSING,
                NotificationRecipient.Status.RETRY_SCHEDULED,
                NotificationRecipient.Status.FAILED,
                NotificationRecipient.Status.SENT,
            ])[:200]
        return Response(envelope(
            success=True,
            message='Email queue',
            data={'items': QueueRecipientSerializer(qs[:100], many=True).data, 'stats': get_queue_stats()},
        ))


class EmailQueueRetryView(_SuperAdminView):
    def post(self, request, recipient_id: int):
        recipient = NotificationRecipient.objects.filter(pk=recipient_id).first()
        if not recipient:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        recipient.status = NotificationRecipient.Status.QUEUED
        recipient.next_retry_at = None
        recipient.attempts = 0
        recipient.last_error = ''
        recipient.save()
        enqueue_recipient(recipient)
        return Response(envelope(success=True, message='Retry queued', data={'id': recipient.pk}))


class EmailQueueCancelView(_SuperAdminView):
    def post(self, request, recipient_id: int):
        recipient = NotificationRecipient.objects.filter(pk=recipient_id).first()
        if not recipient:
            return Response(envelope(success=False, message='Not found'), status=status.HTTP_404_NOT_FOUND)
        recipient.status = NotificationRecipient.Status.CANCELLED
        recipient.save(update_fields=['status', 'updated_at'])
        return Response(envelope(success=True, message='Cancelled', data={'id': recipient.pk}))


class EmailTestCenterView(_SuperAdminView):
    def post(self, request):
        serializer = EmailTestSendSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(envelope(success=False, message='Validation error', errors=serializer.errors),
                            status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        if data.get('template_code'):
            rendered = render_notification(
                template_code=data['template_code'],
                channel='EMAIL',
                language=data['language'],
                context={'user_name': 'Test', 'user_email': data['recipient_email']},
            )
            subject, body_html, body_text = rendered.subject, rendered.body_html, rendered.body_text
        else:
            subject = data.get('subject') or 'Digital Talent Center — Test'
            body_html = data.get('body_html') or '<p>Test email from Email Test Center.</p>'
            body_text = subject
        ok, message, details = send_test_email(
            to=data['recipient_email'],
            subject=subject,
            body_html=body_html,
            body_text=body_text,
        )
        return Response(envelope(success=ok, message=message, data=details),
                        status=status.HTTP_200_OK if ok else status.HTTP_400_BAD_REQUEST)


class EmailAdvancedSettingsView(_SuperAdminView):
    def get(self, request):
        obj = PlatformEmailSettings.get_solo()
        return Response(envelope(
            success=True,
            message='Advanced settings',
            data=PlatformAdvancedSettingsSerializer(obj).data,
        ))

    def patch(self, request):
        obj = PlatformEmailSettings.get_solo()
        serializer = PlatformAdvancedSettingsSerializer(obj, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(envelope(success=False, message='Validation error', errors=serializer.errors),
                            status=status.HTTP_400_BAD_REQUEST)
        track_field_changes(
            user=request.user,
            instance=obj,
            validated_data=serializer.validated_data,
            change_type=EmailSystemAuditLog.ChangeType.ADVANCED,
        )
        serializer.save()
        return Response(envelope(success=True, message='Advanced settings saved', data=serializer.data))


class EmailProviderHealthView(_SuperAdminView):
    def get(self, request):
        return Response(envelope(
            success=True,
            message='Provider health',
            data={'items': get_provider_health(), 'provider': EmailProviderConfigSerializer(EmailProviderConfig.get_solo()).data},
        ))


class EmailSystemAuditView(_SuperAdminView):
    def get(self, request):
        change_type = request.query_params.get('change_type', '')
        qs = EmailSystemAuditLog.objects.select_related('changed_by').order_by('-changed_at')[:100]
        if change_type:
            qs = qs.filter(change_type=change_type)
        return Response(envelope(
            success=True,
            message='Audit log',
            data={'items': EmailSystemAuditLogSerializer(qs, many=True).data},
        ))
