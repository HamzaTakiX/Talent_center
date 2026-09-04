import { useMemo } from 'react';

import type { WorkspaceDocument } from '../../../../shared/workspace-documents';
import { workspaceActivities } from '../data/workspacePlatformMock';
import type { WorkspaceKpi, WorkspaceNote } from '../types';
import { useWorkspaceBoards } from './useWorkspaceBoards';

function shareRatio(part: number, total: number): number | undefined {
  if (total <= 0) return undefined;
  return Math.round((part / total) * 100);
}

/** KPIs alignés sur les blocs visibles de la page workspace. */
export function useWorkspaceStats(
  notes: WorkspaceNote[],
  documents: WorkspaceDocument[],
): WorkspaceKpi[] {
  const { counts } = useWorkspaceBoards();

  return useMemo(() => {
    const viewed = documents.filter((doc) => doc.viewedByEncadrant).length;
    const pinned = notes.filter((note) => note.pinned).length;
    const activityTotal = workspaceActivities.length;

    return [
      {
        id: 'boards',
        value: String(counts.all),
        hint: { saved: counts.saved, draft: counts.draft },
        ratio: shareRatio(counts.saved, counts.all),
      },
      {
        id: 'documents',
        value: String(documents.length),
        hint: { count: viewed },
        ratio: shareRatio(viewed, documents.length),
      },
      {
        id: 'notes',
        value: String(notes.length),
        hint: { count: pinned },
        ratio: shareRatio(pinned, notes.length),
      },
      {
        id: 'activity',
        value: String(activityTotal),
        hint: { count: activityTotal },
      },
    ];
  }, [counts.all, counts.draft, counts.saved, documents, notes]);
}
