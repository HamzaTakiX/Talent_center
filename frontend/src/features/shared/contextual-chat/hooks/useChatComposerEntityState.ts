import { useCallback, useEffect, useState } from 'react';
import type { ChatComposerPendingEntity } from '../types/chatEntityTypes';

/** Pending entity chips in the message composer; cleared when conversation changes. */
export function useChatComposerEntityState(conversationKey?: string) {
  const [pendingEntities, setPendingEntities] = useState<ChatComposerPendingEntity[]>([]);

  useEffect(() => {
    setPendingEntities([]);
  }, [conversationKey]);

  const removePendingEntity = useCallback((entityType: string, entityId: string) => {
    setPendingEntities((prev) =>
      prev.filter((item) => !(item.entity_type === entityType && item.entity_id === entityId)),
    );
  }, []);

  const clearPendingEntities = useCallback(() => {
    setPendingEntities([]);
  }, []);

  return {
    pendingEntities,
    setPendingEntities,
    removePendingEntity,
    clearPendingEntities,
  };
}
