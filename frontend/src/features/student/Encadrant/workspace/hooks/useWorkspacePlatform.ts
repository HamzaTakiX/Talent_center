import { useEffect, useMemo, useState } from 'react';

import {
  workspaceActivities,
  workspaceDocuments,
  workspaceKnowledge,
  workspaceNotes,
} from '../data/workspacePlatformMock';
import type { WorkspaceTabId } from '../types';

export function useWorkspacePlatform() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('documents');
  const [search, setSearch] = useState('');
  const [documentsView, setDocumentsView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return {
      documents: workspaceDocuments.filter((d) => d.nameKey.toLowerCase().includes(q) || d.id.includes(q)),
      notes: workspaceNotes.filter((n) => n.titleKey.toLowerCase().includes(q)),
      activities: workspaceActivities.filter((a) => a.messageKey.toLowerCase().includes(q)),
      knowledge: workspaceKnowledge.filter((k) => k.titleKey.toLowerCase().includes(q)),
    };
  }, [search]);

  return {
    loading,
    activeTab,
    setActiveTab,
    search,
    setSearch,
    searchResults,
    documentsView,
    setDocumentsView,
  };
}
