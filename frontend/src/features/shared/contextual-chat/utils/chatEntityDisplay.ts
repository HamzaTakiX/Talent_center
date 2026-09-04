import type { ChatEntityReference } from '../types/chatEntityTypes';

export type ChatEntityTone = 'task' | 'meeting' | 'report' | 'offer' | 'default';

export function chatEntityTone(entityType?: string): ChatEntityTone {
  switch (entityType) {
    case 'task':
      return 'task';
    case 'meeting':
      return 'meeting';
    case 'report':
      return 'report';
    case 'internship_offer':
    case 'offer_application':
      return 'offer';
    default:
      return 'default';
  }
}

export function chatEntityTypeLabelKey(entityType?: string): string {
  switch (entityType) {
    case 'task':
      return 'admin.chat.tags.task';
    case 'meeting':
      return 'admin.chat.tags.meeting';
    case 'report':
      return 'admin.chat.tags.report';
    case 'internship_offer':
      return 'admin.chat.entityPickerGroups.internship_offer';
    case 'offer_application':
      return 'admin.chat.entityPickerGroups.offer_application';
    default:
      return 'admin.chat.entityPickerTitle';
  }
}

export function chatEntityTypeDefaultLabel(entityType?: string): string {
  switch (entityType) {
    case 'task':
      return 'Tâche';
    case 'meeting':
      return 'Réunion';
    case 'report':
      return 'Rapport';
    case 'internship_offer':
      return 'Stage';
    case 'offer_application':
      return 'Candidature';
    default:
      return 'Élément';
  }
}

export function entityRefKey(ref: Pick<ChatEntityReference, 'entity_type' | 'entity_id'>): string {
  return `${ref.entity_type}:${ref.entity_id}`;
}
