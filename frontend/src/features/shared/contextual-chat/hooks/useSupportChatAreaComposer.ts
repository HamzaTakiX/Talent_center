import { useCallback, useEffect, useState } from 'react';
import { useChatComposerEntityState } from './useChatComposerEntityState';
import { useChatComposerTagState } from './useChatComposerTagState';
import type { ChatEntityReference } from '../types/chatEntityTypes';

type SendHandler = (
  text: string,
  files?: File[],
  tagCodes?: string[],
  entityRefs?: ChatEntityReference[],
) => void;

/** Draft, attachments, intent tags, and entity references for support chat composers. */
export function useSupportChatAreaComposer(conversationKey: string | undefined, onSend: SendHandler) {
  const [draft, setDraft] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const { pendingTags, setPendingTags, tagCodes, removePendingTag, clearPendingTags } =
    useChatComposerTagState(conversationKey);
  const {
    pendingEntities,
    setPendingEntities,
    removePendingEntity,
    clearPendingEntities,
  } = useChatComposerEntityState(conversationKey);

  useEffect(() => {
    setDraft('');
    setPendingFiles([]);
    setAttachError(null);
  }, [conversationKey]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text && !pendingFiles.length) return;
    onSend(
      text,
      pendingFiles.length ? pendingFiles : undefined,
      tagCodes.length ? tagCodes : undefined,
      pendingEntities.length ? pendingEntities : undefined,
    );
    setDraft('');
    setPendingFiles([]);
    setAttachError(null);
    clearPendingTags();
    clearPendingEntities();
  }, [
    clearPendingEntities,
    clearPendingTags,
    draft,
    onSend,
    pendingEntities,
    pendingFiles,
    tagCodes,
  ]);

  return {
    draft,
    setDraft,
    pendingFiles,
    setPendingFiles,
    attachError,
    setAttachError,
    handleSend,
    pendingTags,
    setPendingTags,
    removePendingTag,
    pendingEntities,
    setPendingEntities,
    removePendingEntity,
  };
}
