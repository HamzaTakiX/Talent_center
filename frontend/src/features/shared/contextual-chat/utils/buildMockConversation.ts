import type { AdminChatParticipant } from '../../../admin/shared/admin-module-chat/adminChatTypes';
import type { ChatModule, ConversationDto } from '../types';

export function buildMockConversation(
  participant: AdminChatParticipant,
  module: ChatModule
): ConversationDto {
  return {
    id: Number(participant.id.replace(/\D/g, '')) || 0,
    title: participant.title,
    conversation_type: 'THREAD',
    last_message_at: new Date().toISOString(),
    last_preview: participant.lastPreview,
    unread_count: participant.unreadCount,
    participants: [],
    metadata_json: {},
    context: {
      module,
      context_kind: participant.contextKind ?? 'workflow_thread',
      entity_type: 'demo_entity',
      entity_id: participant.id,
      entity_label: participant.entityLabel ?? participant.title,
      workflow_status: participant.workflowStatus ?? 'in_review',
      urgency: participant.urgency ?? 'NONE',
      student_user_id: null,
      is_internal_only: false,
      context_snapshot_json: {
        deadline: '2026-06-15',
        related_files: [{ name: 'convention_v2.pdf' }, { name: 'proof_payment.png' }],
        recent_actions: ['Validation demandée', 'SLA surveillé'],
      },
    },
  };
}
