import type { StandardChatMessage } from '../../chat-design-system';
import type { MessageDto } from '../types';
import type { ChatEntityReference } from '../types/chatEntityTypes';

export function buildTaskEntityRef(
  taskId: string,
  label: string,
  subtitle?: string,
  imageUrl?: string,
): ChatEntityReference {
  const ref: ChatEntityReference = {
    entity_type: 'task',
    entity_id: String(taskId),
    label: label.trim() || 'Tâche',
    module: 'encadrant',
  };
  if (subtitle?.trim()) ref.subtitle = subtitle.trim();
  if (imageUrl?.trim()) ref.image_url = imageUrl.trim();
  return ref;
}

export function studentSupervisionTaskChatPath(
  taskId: string,
  taskLabel: string,
  taskMeta?: string,
  taskImage?: string,
): string {
  const params = new URLSearchParams({
    task: String(taskId),
    taskLabel,
  });
  if (taskMeta?.trim()) params.set('taskMeta', taskMeta.trim());
  if (taskImage?.trim()) params.set('taskImage', taskImage.trim());
  return `/student/encadrant/chat?${params.toString()}`;
}

export function messageRefsTask(message: Pick<MessageDto, 'entity_refs'>, taskId: string): boolean {
  const id = String(taskId);
  return (message.entity_refs ?? []).some(
    (ref) => ref.entity_type === 'task' && String(ref.entity_id) === id,
  );
}

function formatMessageTime(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function mapSupervisionMessage(dto: MessageDto): StandardChatMessage {
  return {
    id: String(dto.id),
    direction: dto.is_own ? 'out' : 'in',
    text: dto.body,
    time: formatMessageTime(dto.created_at),
    createdAt: dto.created_at,
    tags: dto.tags?.length ? dto.tags : undefined,
    entityRefs: dto.entity_refs?.length ? dto.entity_refs : undefined,
    deliveryStatus: dto.delivery_status,
  };
}
