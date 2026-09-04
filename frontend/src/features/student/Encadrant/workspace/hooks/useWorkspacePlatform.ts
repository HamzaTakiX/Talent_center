import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { studentWorkspaceBoardPath } from '../../constants/routes';
import { createWorkspaceBoardId } from '../whiteboard/utils/whiteboardBoardStorage';
import { registerWorkspaceBoard } from '../whiteboard/utils/whiteboardBoardRegistry';
import { workspaceActivities } from '../data/workspacePlatformMock';
import type { WorkspaceTabId } from '../types';
import { useWorkspaceDocuments } from './useWorkspaceDocuments';
import { useWorkspaceNotes } from './useWorkspaceNotes';
import { useWorkspaceStats } from './useWorkspaceStats';

export function useWorkspacePlatform() {
  const navigate = useNavigate();
  const [bootstrapping, setBootstrapping] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('documents');
  const [search, setSearch] = useState('');
  const [documentsView, setDocumentsView] = useState<'grid' | 'list'>('grid');
  const notes = useWorkspaceNotes();
  const documents = useWorkspaceDocuments();
  const kpis = useWorkspaceStats(notes.notes, documents.documents);

  useEffect(() => {
    const t = window.setTimeout(() => setBootstrapping(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  const loading = bootstrapping || documents.loading;
  const allNotes = notes.notes;

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return {
      documents: documents.documents.filter((doc) => doc.name.toLowerCase().includes(q)),
      notes: allNotes.filter((n) => n.titleKey.toLowerCase().includes(q)),
      activities: workspaceActivities.filter((a) => a.messageKey.toLowerCase().includes(q)),
    };
  }, [allNotes, documents.documents, search]);

  /** Ouvre un espace collaboratif vierge sur sa propre URL, partageable telle quelle. */
  const createWorkspace = useCallback(() => {
    const boardId = createWorkspaceBoardId();
    registerWorkspaceBoard(boardId);
    navigate(studentWorkspaceBoardPath(boardId));
  }, [navigate]);

  return {
    loading,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    searchResults,
    documentsView,
    setDocumentsView,
    createWorkspace,
    notes,
    documents,
    kpis,
  };
}
