import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ensureReportContent,
  getReportDocument,
  saveReportToStorage,
} from '../data/reportPlatformMock';
import { loadAssignedReportModel } from '../data/reportModelGuideMock';
import { REPORT_TITLE_MAX_LENGTH } from '../constants/limits';
import type {
  AutoSaveState,
  ReportAnalytics,
  ReportComment,
  ReportStatus,
  StudentReportDocument,
} from '../types';
import type { ReportModelGuide } from '../types/reportModelGuide';
import { calculateReportModelProgress } from '../utils/reportModelProgress';

const AUTOSAVE_DELAY_MS = 2000;
const AUTOSAVE_PREF_KEY = 'esca-report-autosave-enabled';

function readAutoSavePref(): boolean {
  try {
    const v = localStorage.getItem(AUTOSAVE_PREF_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

function countImages(html: string): number {
  return (html.match(/<img\b/gi) ?? []).length;
}

export function useReportPlatform(reportId: string) {
  const [report, setReport] = useState<StudentReportDocument>(() =>
    ensureReportContent(getReportDocument(reportId)),
  );
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>('idle');
  const [autoSaveEnabled, setAutoSaveEnabledState] = useState(readAutoSavePref);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);
  const [modelGuidePanelOpen, setModelGuidePanelOpen] = useState(false);
  const [exportPanelOpen, setExportPanelOpen] = useState(false);
  const [modelGuide, setModelGuide] = useState<ReportModelGuide | null>(() => loadAssignedReportModel());
  const [modelGuideState, setModelGuideState] = useState<'loading' | 'ready' | 'empty' | 'error'>('ready');
  const [isDirty, setIsDirty] = useState(false);
  const saveTimerRef = useRef<number | null>(null);
  const reportRef = useRef(report);
  reportRef.current = report;

  useEffect(() => {
    const doc = ensureReportContent(getReportDocument(reportId));
    setReport(doc);
    setIsDirty(false);
  }, [reportId]);

  const persist = useCallback((doc: StudentReportDocument) => {
    saveReportToStorage(doc);
    setIsDirty(false);
  }, []);

  const setAutoSave = useCallback((enabled: boolean) => {
    setAutoSaveEnabledState(enabled);
    try {
      localStorage.setItem(AUTOSAVE_PREF_KEY, String(enabled));
    } catch {
      /* ignore */
    }
    if (!enabled) {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      setAutoSaveState('idle');
    }
  }, []);

  const scheduleAutoSave = useCallback(
    (doc: StudentReportDocument) => {
      setIsDirty(true);
      if (!autoSaveEnabled) return;
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      setAutoSaveState('saving');
      saveTimerRef.current = window.setTimeout(() => {
        persist({ ...doc, lastModified: new Date().toISOString() });
        const label = new Date().toLocaleTimeString();
        setSavedLabel(label);
        setAutoSaveState('saved');
        window.setTimeout(() => setAutoSaveState('idle'), 2500);
      }, AUTOSAVE_DELAY_MS);
    },
    [autoSaveEnabled, persist],
  );

  const updateContent = useCallback(
    (content: string) => {
      setReport((prev) => {
        const next = { ...prev, content, lastModified: new Date().toISOString() };
        scheduleAutoSave(next);
        return next;
      });
    },
    [scheduleAutoSave],
  );

  const saveNow = useCallback(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setAutoSaveState('saving');
    const updated = { ...reportRef.current, lastModified: new Date().toISOString() };
    persist(updated);
    setReport(updated);
    setSavedLabel(new Date().toLocaleTimeString());
    setAutoSaveState('saved');
    window.setTimeout(() => setAutoSaveState('idle'), 2500);
  }, [persist]);

  const discardChanges = useCallback(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const doc = ensureReportContent(getReportDocument(reportId));
    setReport(doc);
    setIsDirty(false);
    setAutoSaveState('idle');
  }, [reportId]);

  const flushPendingSave = useCallback(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      const updated = { ...reportRef.current, lastModified: new Date().toISOString() };
      persist(updated);
      setReport(updated);
      setSavedLabel(new Date().toLocaleTimeString());
      setAutoSaveState('saved');
      return;
    }
    if (isDirty) {
      saveNow();
    }
  }, [isDirty, persist, saveNow]);

  const setTitle = useCallback(
    (title: string) => {
      const trimmed = title.slice(0, REPORT_TITLE_MAX_LENGTH);
      setReport((prev) => {
        const next = { ...prev, title: trimmed, lastModified: new Date().toISOString() };
        scheduleAutoSave(next);
        return next;
      });
    },
    [scheduleAutoSave],
  );

  const setStatus = useCallback(
    (status: ReportStatus) => {
      setReport((prev) => {
        const next = { ...prev, status, lastModified: new Date().toISOString() };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const restoreVersion = useCallback(
    (versionId: string) => {
      setReport((prev) => {
        const version = prev.versions.find((v) => v.id === versionId);
        if (!version) return prev;
        const content =
          version.snapshot.body ??
          Object.values(version.snapshot).filter(Boolean).join('');
        const versions = prev.versions.map((v) => ({
          ...v,
          isCurrent: v.id === versionId,
        }));
        const next = { ...prev, content, versions, lastModified: new Date().toISOString() };
        persist(next);
        return next;
      });
      setVersionPanelOpen(false);
    },
    [persist],
  );

  const createVersion = useCallback(() => {
    setReport((prev) => {
      const wordCount = countWords(prev.content);
      const newVersion = {
        id: `v${Date.now()}`,
        label: `Version ${prev.versions.length + 1}`,
        createdAt: new Date().toISOString(),
        wordCount,
        snapshot: { body: prev.content },
        isCurrent: true,
      };
      const versions = [newVersion, ...prev.versions.map((v) => ({ ...v, isCurrent: false }))];
      const next = { ...prev, versions, lastModified: new Date().toISOString() };
      persist(next);
      return next;
    });
  }, [persist]);

  const updateComment = useCallback(
    (commentId: string, patch: Partial<ReportComment>) => {
      setReport((prev) => {
        const comments = prev.comments.map((c) =>
          c.id === commentId ? { ...c, ...patch } : c,
        );
        const next = { ...prev, comments, lastModified: new Date().toISOString() };
        scheduleAutoSave(next);
        return next;
      });
    },
    [scheduleAutoSave],
  );

  const replyToComment = useCallback(
    (commentId: string, text: string) => {
      setReport((prev) => {
        const comments = prev.comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: [
                  ...c.replies,
                  { id: `r-${Date.now()}`, author: 'Vous', text, createdAt: new Date().toISOString() },
                ],
              }
            : c,
        );
        const next = { ...prev, comments, lastModified: new Date().toISOString() };
        scheduleAutoSave(next);
        return next;
      });
    },
    [scheduleAutoSave],
  );

  const refreshModelGuide = useCallback(() => {
    setModelGuideState('loading');
    window.setTimeout(() => {
      try {
        const model = loadAssignedReportModel();
        setModelGuide(model);
        setModelGuideState(model ? 'ready' : 'empty');
      } catch {
        setModelGuideState('error');
      }
    }, 250);
  }, []);

  const analytics: ReportAnalytics = useMemo(() => {
    const wordCount = countWords(report.content);
    const completionPercent = Math.min(
      100,
      Math.round((wordCount / report.targetWords) * 100),
    );
    const structure = calculateReportModelProgress(modelGuide, report.content);
    return {
      wordCount,
      completionPercent,
      readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
      structureProgressPercent: structure.overallPercent,
      imageCount: countImages(report.content),
    };
  }, [report, modelGuide]);

  const exportPrint = useCallback(() => {
    window.print();
  }, []);

  return {
    report,
    updateContent,
    saveNow,
    discardChanges,
    flushPendingSave,
    setTitle,
    setStatus,
    autoSaveState,
    autoSaveEnabled,
    setAutoSave,
    savedLabel,
    isDirty,
    analytics,
    rightPanelOpen,
    setRightPanelOpen,
    versionPanelOpen,
    setVersionPanelOpen,
    modelGuidePanelOpen,
    setModelGuidePanelOpen,
    modelGuide,
    modelGuideState,
    refreshModelGuide,
    exportPanelOpen,
    setExportPanelOpen,
    restoreVersion,
    createVersion,
    updateComment,
    replyToComment,
    exportPrint,
  };
}
