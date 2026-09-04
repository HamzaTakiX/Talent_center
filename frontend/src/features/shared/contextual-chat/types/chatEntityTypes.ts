import type { ChatModule } from '../types';

/** Reference to a module item attached to a chat message (document, offer, etc.). */
export type ChatEntityReference = {
  entity_type: string;
  entity_id: string;
  label: string;
  subtitle?: string;
  /** Optional preview image (assignee avatar, cover, etc.). */
  image_url?: string;
  module?: ChatModule;
};

export type ChatComposerPendingEntity = ChatEntityReference;
