"""Django signals for automatic history on model changes."""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.documents.models import DocumentRequest


@receiver(pre_save, sender=DocumentRequest)
def _document_request_capture_old_status(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = DocumentRequest.objects.filter(pk=instance.pk).values_list('status', flat=True).first()
        instance._audit_old_status = old
    except Exception:
        instance._audit_old_status = None


@receiver(post_save, sender=DocumentRequest)
def _document_request_status_audit(sender, instance, created, **kwargs):
    from apps.history.context import get_current_request
    from apps.history.integrations.documents import document_request_status_changed

    old_status = getattr(instance, '_audit_old_status', '')
    if created:
        document_request_status_changed(
            request_obj=instance,
            actor=getattr(instance, 'requested_by', None),
            old_status='',
            new_status=instance.status,
        )
        return
    if old_status and old_status != instance.status:
        actor_user = getattr(instance, '_history_actor', None)
        if not actor_user:
            actor_user = instance.reviewed_by
        if not actor_user:
            req = get_current_request()
            if req and getattr(req, 'user', None) and req.user.is_authenticated:
                actor_user = req.user
        document_request_status_changed(
            request_obj=instance,
            actor=actor_user,
            old_status=old_status,
            new_status=instance.status,
        )
