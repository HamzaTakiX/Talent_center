import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { workspaceNotes as initialNotes } from '../data/workspacePlatformMock';
import type { WorkspaceNote } from '../types';
import { workspaceNoteExcerpt, workspaceNoteTitle } from '../utils/workspaceNotes';

const EXCERPT_MAX_LENGTH = 120;

export interface UseWorkspaceNotesResult {
  notes: WorkspaceNote[];
  activeNoteId: string | null;
  draftTitle: string;
  draftBody: string;
  canSave: boolean;
  setDraftTitle: (value: string) => void;
  setDraftBody: (value: string) => void;
  startNewNote: () => void;
  selectNote: (id: string) => void;
  saveDraft: () => void;
  togglePin: (id: string) => void;
}

function buildExcerpt(body: string): string {
  const flat = body.replace(/\s+/g, ' ').trim();
  return flat.length > EXCERPT_MAX_LENGTH ? `${flat.slice(0, EXCERPT_MAX_LENGTH).trimEnd()}…` : flat;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** État local des notes du workspace : liste, sélection et brouillon de l'éditeur. */
export function useWorkspaceNotes(): UseWorkspaceNotesResult {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<WorkspaceNote[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');

  const startNewNote = useCallback(() => {
    setActiveNoteId(null);
    setDraftTitle('');
    setDraftBody('');
  }, []);

  const selectNote = useCallback(
    (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      setActiveNoteId(id);
      setDraftTitle(workspaceNoteTitle(t, note));
      setDraftBody(workspaceNoteExcerpt(t, note));
    },
    [notes, t],
  );

  const canSave = useMemo(
    () => draftTitle.trim().length > 0 || draftBody.trim().length > 0,
    [draftBody, draftTitle],
  );

  const saveDraft = useCallback(() => {
    if (!canSave) return;

    const title = draftTitle.trim() || t('student.encadrant.workspace.platform.notes.untitled');
    const excerpt = buildExcerpt(draftBody);

    if (activeNoteId) {
      setNotes((current) =>
        current.map((note) =>
          note.id === activeNoteId
            ? { ...note, titleKey: title, excerptKey: excerpt, updatedAt: today(), isUserCreated: true }
            : note,
        ),
      );
      return;
    }

    const created: WorkspaceNote = {
      id: `note-${Date.now()}`,
      titleKey: title,
      excerptKey: excerpt,
      tags: [],
      pinned: false,
      updatedAt: today(),
      isUserCreated: true,
    };
    setNotes((current) => [created, ...current]);
    setActiveNoteId(created.id);
  }, [activeNoteId, canSave, draftBody, draftTitle, t]);

  const togglePin = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)),
    );
  }, []);

  return {
    notes,
    activeNoteId,
    draftTitle,
    draftBody,
    canSave,
    setDraftTitle,
    setDraftBody,
    startNewNote,
    selectNote,
    saveDraft,
    togglePin,
  };
}
