"""Move offer chat admin archives from global is_archived to metadata flag."""

from django.db import migrations


def repair_offer_admin_inbox_archives(apps, schema_editor):
    Conversation = apps.get_model('chat', 'Conversation')
    ConversationContext = apps.get_model('chat', 'ConversationContext')

    offer_conv_ids = list(
        ConversationContext.objects.filter(module='offers').values_list('conversation_id', flat=True)
    )
    for conv in Conversation.objects.filter(pk__in=offer_conv_ids, is_archived=True):
        meta = dict(conv.metadata_json or {})
        meta['admin_inbox_archived'] = True
        conv.metadata_json = meta
        conv.is_archived = False
        conv.save(update_fields=['metadata_json', 'is_archived'])

    ConversationContext.objects.filter(
        conversation_id__in=offer_conv_ids,
        workflow_state='ARCHIVED',
    ).update(workflow_state='WAITING_ADMIN')


class Migration(migrations.Migration):
    dependencies = [
        ('chat', '0005_rename_chat_messag_user_id_6f1a2b_idx_chat_messag_user_id_b47113_idx_and_more'),
    ]

    operations = [
        migrations.RunPython(repair_offer_admin_inbox_archives, migrations.RunPython.noop),
    ]
