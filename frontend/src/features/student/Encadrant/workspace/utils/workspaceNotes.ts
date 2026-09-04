import type { TFunction } from 'i18next';

import type { WorkspaceNote } from '../types';

/**
 * Les notes du mock portent des clés i18n, celles rédigées par l'étudiant du texte brut :
 * seules les premières doivent passer par la traduction.
 */
export function workspaceNoteTitle(t: TFunction, note: WorkspaceNote): string {
  return note.isUserCreated ? note.titleKey : t(note.titleKey);
}

export function workspaceNoteExcerpt(t: TFunction, note: WorkspaceNote): string {
  return note.isUserCreated ? note.excerptKey : t(note.excerptKey);
}
