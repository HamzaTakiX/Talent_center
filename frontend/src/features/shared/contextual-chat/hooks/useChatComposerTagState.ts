import { useCallback, useEffect, useState } from 'react';
import type { ChatComposerPendingTag } from '../types/chatTagTypes';

/** Pending tag chips in the message composer; cleared when conversation changes. */
export function useChatComposerTagState(conversationKey?: string) {
  const [pendingTags, setPendingTags] = useState<ChatComposerPendingTag[]>([]);

  useEffect(() => {
    setPendingTags([]);
  }, [conversationKey]);

  const tagCodes = pendingTags.map((tag) => tag.code);

  const removePendingTag = useCallback((code: string) => {
    setPendingTags((prev) => prev.filter((tag) => tag.code !== code));
  }, []);

  const clearPendingTags = useCallback(() => {
    setPendingTags([]);
  }, []);

  return {
    pendingTags,
    setPendingTags,
    tagCodes,
    removePendingTag,
    clearPendingTags,
  };
}
