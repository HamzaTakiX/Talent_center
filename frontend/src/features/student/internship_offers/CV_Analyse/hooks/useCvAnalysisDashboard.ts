import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  analyzeCvIntelligenceFileSafe,
  analyzeCvIntelligenceSafe,
  fetchCvIntelligenceDashboardSafe,
} from '../../../../cv/api/cvIntelligenceApi';
import type {
  CvAnalysisDashboardData,
  CvAnalysisNavSection,
  CvAnalysisStatus,
  DashboardViewState,
  ImportedCvPreview,
} from '../types/cvAnalysisDashboard';
import { useAuth } from '../../../../auth/hooks/useAuth';
import {
  CV_DRAFT_STORAGE_KEY,
  profileInputFromUser,
  resolveStudentCvSnapshot,
  type CvBuilderSnapshot,
} from '../utils/cvDraftReader';
import {
  buildImportedCvPreview,
  revokeImportedCvPreview,
} from '../utils/buildImportedCvPreview';
import { buildEmptyDashboard, mergeDashboardWithCvMeta } from '../utils/mapBuilderAnalysisToDashboard';
import { computeCvHashFromFile, computeCvHashFromSnapshot } from '../utils/computeCvHash';
import { writeCachedCvDashboard, clearCachedCvDashboard } from '../utils/cvAnalysisDashboardCache';
import { resolveInitialDashboardState } from '../utils/resolveInitialDashboardState';

function hasPersistedAccessToken(): boolean {
  try {
    return Boolean(localStorage.getItem('access_token'));
  } catch {
    return false;
  }
}

function resolveClientAnalysisStatus(
  serverStatus: CvAnalysisStatus,
  currentCvHash: string,
  analyzedCvHash: string | null | undefined,
): CvAnalysisStatus {
  if (serverStatus === 'none' || serverStatus === 'processing' || serverStatus === 'failed') {
    return serverStatus;
  }
  if (currentCvHash && analyzedCvHash && currentCvHash !== analyzedCvHash) {
    return 'outdated';
  }
  return serverStatus === 'outdated' ? 'outdated' : 'up_to_date';
}

const SECTION_IDS: Record<CvAnalysisNavSection, string> = {
  upload: 'cva-section-upload',
  analysis: 'cva-section-analysis',
  compatibility: 'cva-section-compatibility',
  recommendations: 'cva-section-recommendations',
  skills: 'cva-section-skills',
  'ai-suggestions': 'cva-section-ai',
  interview: 'cva-section-interview',
};

interface AnalyzeOptions {
  cvSource?: 'builder' | 'imported';
  cvFileName?: string;
  cvFileUrl?: string;
  importedPreview?: ImportedCvPreview;
  force?: boolean;
}

function cvSnapshotFromFileName(fileName: string): CvBuilderSnapshot {
  const name = fileName.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
  return {
    details: { name },
    workExp: [],
    education: [],
    projects: [],
    skills: [],
    languages: [],
  };
}

function isImportedAnalysis(options: Pick<AnalyzeOptions, 'cvSource' | 'importedPreview'>): boolean {
  return options.cvSource === 'imported' || Boolean(options.importedPreview);
}

interface UseCvAnalysisDashboardOptions {
  initialState?: DashboardViewState;
}

export function useCvAnalysisDashboard({
  initialState = 'success',
}: UseCvAnalysisDashboardOptions = {}) {
  const { user, isAuthReady } = useAuth();
  const boot = resolveInitialDashboardState(initialState);
  const [viewState, setViewState] = useState<DashboardViewState>(boot.viewState);
  const [data, setData] = useState<CvAnalysisDashboardData | null>(boot.data);
  const [analysisStatus, setAnalysisStatus] = useState<CvAnalysisStatus>(boot.analysisStatus);
  const [activeSection, setActiveSection] = useState<CvAnalysisNavSection>('analysis');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRatiosRef = useRef<Map<string, number>>(new Map());
  const navLockRef = useRef(false);
  const navLockTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importedPreviewRef = useRef<ImportedCvPreview | null>(null);
  const resolvedCvRef = useRef<{
    cv: CvBuilderSnapshot;
    cvSource: 'builder' | 'imported';
    cvFileName?: string;
    cvFileUrl?: string;
    cvHash: string;
  } | null>(null);
  const loadGenerationRef = useRef(0);
  const analysisInFlightRef = useRef(false);
  const autoAnalyzeQueuedRef = useRef(false);
  const activeCvModeRef = useRef<'builder' | 'imported'>('builder');
  const hasDisplayedDataRef = useRef(Boolean(boot.data));
  const didFetchRef = useRef(false);
  const userRef = useRef(user);
  userRef.current = user;

  const setImportedPreview = useCallback((preview: ImportedCvPreview | null) => {
    revokeImportedCvPreview(importedPreviewRef.current);
    importedPreviewRef.current = preview;
  }, []);

  const applyDashboardData = useCallback(
    (
      dashboard: CvAnalysisDashboardData,
      cv: CvBuilderSnapshot,
      options: AnalyzeOptions & { status: CvAnalysisStatus },
    ) => {
      const isImportedFile = isImportedAnalysis(options);
      if (isImportedFile) {
        activeCvModeRef.current = 'imported';
      } else if (options.cvSource === 'builder') {
        activeCvModeRef.current = 'builder';
      }

      const merged = mergeDashboardWithCvMeta(dashboard, cv, {
        cvFileName: options.cvFileName,
        cvSource: isImportedFile ? 'imported' : options.cvSource,
        user: userRef.current,
      });

      const nextData: CvAnalysisDashboardData = {
        ...merged,
        meta: {
          ...merged.meta,
          analysisStatus: options.status,
        },
        cvSnapshot: isImportedFile ? undefined : cv,
        cvFileUrl: isImportedFile ? undefined : options.cvFileUrl,
        importedPreview: options.importedPreview ?? importedPreviewRef.current ?? undefined,
        cvSource: isImportedFile ? 'imported' : merged.cvSource,
        isDefaultCv: !isImportedFile,
      };

      setData(nextData);
      setAnalysisStatus(options.status);
      setViewState('success');
      setActiveSection(isImportedFile ? 'upload' : 'analysis');
      hasDisplayedDataRef.current = true;

      const cachePayload =
        isImportedFile && nextData.importedPreview
          ? {
              ...nextData,
              importedPreview: {
                fileName: nextData.importedPreview.fileName,
                kind: nextData.importedPreview.kind,
                mimeType: nextData.importedPreview.mimeType,
              },
            }
          : nextData;
      writeCachedCvDashboard(cachePayload, options.status, nextData.meta?.cvHash ?? null);
    },
    [],
  );

  const runAnalysis = useCallback(
    async (cv: CvBuilderSnapshot, options: AnalyzeOptions = {}) => {
      if (analysisInFlightRef.current) return;
      analysisInFlightRef.current = true;
      setViewState('analyzing');
      setLoadError(null);

      try {
        const isImportedFile =
          isImportedAnalysis(options) || activeCvModeRef.current === 'imported';
        let outcome;

        if (isImportedFile) {
          const fileInput = fileInputRef.current?.files?.[0];
          if (fileInput) {
            outcome = await analyzeCvIntelligenceFileSafe(fileInput, { force: options.force });
          } else {
            outcome = await analyzeCvIntelligenceSafe(cv as unknown as Record<string, unknown>, {
              force: options.force,
            });
          }
        } else {
          outcome = await analyzeCvIntelligenceSafe(cv as unknown as Record<string, unknown>, {
            force: options.force,
          });
        }

        if (outcome.ok) {
          autoAnalyzeQueuedRef.current = false;
          applyDashboardData(outcome.dashboard, cv, {
            ...options,
            status: outcome.status ?? 'up_to_date',
          });
        } else {
          autoAnalyzeQueuedRef.current = false;
          const empty = buildEmptyDashboard(cv, {
            cvFileName: options.cvFileName,
            cvSource: options.cvSource,
            user: userRef.current,
          });
          setData({
            ...empty,
            meta: { ...empty.meta, analysisStatus: 'failed' },
          });
          setAnalysisStatus('failed');
          setLoadError(outcome.error);
          setViewState('error');
        }
      } catch {
        autoAnalyzeQueuedRef.current = false;
        setViewState('error');
        setData(null);
        setAnalysisStatus('failed');
        setLoadError('Impossible de charger l\'analyse CV.');
      } finally {
        analysisInFlightRef.current = false;
      }
    },
    [applyDashboardData],
  );

  const canFetchDashboard = isAuthReady || hasPersistedAccessToken();

  const loadDashboard = useCallback(async () => {
    if (!canFetchDashboard || activeCvModeRef.current === 'imported') return;

    const generation = ++loadGenerationRef.current;
    if (!hasDisplayedDataRef.current) {
      setViewState('loading');
    }

    setImportedPreview(null);
    const profileInput = profileInputFromUser(userRef.current);
    const resolved = resolveStudentCvSnapshot(profileInput);
    if (!resolved) {
      if (generation !== loadGenerationRef.current) return;
      setViewState('empty');
      setData(null);
      setAnalysisStatus('none');
      resolvedCvRef.current = null;
      hasDisplayedDataRef.current = false;
      return;
    }

    const cvSource = resolved.source === 'profile_file' ? 'imported' : 'builder';
    const baseOptions = {
      cvSource,
      cvFileName: resolved.fileName,
      cvFileUrl: resolved.source === 'profile_file' ? profileInput?.cvFileUrl : undefined,
    };

    // Fetch dashboard immediately; compute hash in parallel (no sequential wait).
    const storedPromise = fetchCvIntelligenceDashboardSafe();
    const cvHashPromise = computeCvHashFromSnapshot(resolved.cv);

    const [stored, cvHash] = await Promise.all([storedPromise, cvHashPromise]);
    if (generation !== loadGenerationRef.current) return;

    resolvedCvRef.current = {
      cv: resolved.cv,
      cvSource,
      cvFileName: resolved.fileName,
      cvFileUrl: baseOptions.cvFileUrl,
      cvHash,
    };

    if (!stored.ok) {
      if (hasDisplayedDataRef.current) return;
      setLoadError(stored.error);
      setViewState('error');
      setAnalysisStatus('failed');
      return;
    }

    const { response } = stored;
    const status = resolveClientAnalysisStatus(
      response.status,
      cvHash,
      response.analyzed_cv_hash,
    );

    if ((status === 'up_to_date' || status === 'outdated') && response.dashboard) {
      applyDashboardData(response.dashboard, resolved.cv, {
        ...baseOptions,
        status,
      });
      if (status === 'outdated' && !analysisInFlightRef.current && !autoAnalyzeQueuedRef.current) {
        autoAnalyzeQueuedRef.current = true;
        void runAnalysis(resolved.cv, { ...baseOptions, force: false });
      }
      return;
    }

    if (status === 'processing') {
      setAnalysisStatus('processing');
      if (!hasDisplayedDataRef.current) {
        setViewState('analyzing');
      }
      return;
    }

    if (status === 'failed' && response.dashboard) {
      applyDashboardData(response.dashboard, resolved.cv, { ...baseOptions, status: 'failed' });
      setLoadError('La dernière analyse a échoué.');
      return;
    }

    if (!analysisInFlightRef.current && !autoAnalyzeQueuedRef.current) {
      autoAnalyzeQueuedRef.current = true;
      void runAnalysis(resolved.cv, { ...baseOptions, force: false });
    }
  }, [applyDashboardData, canFetchDashboard, runAnalysis, setImportedPreview]);

  const loadDashboardRef = useRef(loadDashboard);
  loadDashboardRef.current = loadDashboard;

  const runAnalysisRef = useRef(runAnalysis);
  runAnalysisRef.current = runAnalysis;

  const syncCvAndMaybeAnalyze = useCallback(async () => {
    if (
      activeCvModeRef.current === 'imported' ||
      analysisInFlightRef.current ||
      autoAnalyzeQueuedRef.current
    ) {
      return;
    }

    const profileInput = profileInputFromUser(userRef.current);
    const resolved = resolveStudentCvSnapshot(profileInput);
    if (!resolved) return;

    const cvSource = resolved.source === 'profile_file' ? 'imported' : 'builder';
    const cvHash = await computeCvHashFromSnapshot(resolved.cv);
    const prev = resolvedCvRef.current;
    if (prev?.cvHash === cvHash) return;

    const baseOptions = {
      cvSource,
      cvFileName: resolved.fileName,
      cvFileUrl: cvSource === 'imported' ? profileInput?.cvFileUrl : undefined,
    };

    resolvedCvRef.current = { cv: resolved.cv, cvHash, ...baseOptions };
    clearCachedCvDashboard();
    autoAnalyzeQueuedRef.current = true;
    void runAnalysisRef.current(resolved.cv, { ...baseOptions, force: false });
  }, []);

  useEffect(() => {
    const onResume = () => {
      if (document.visibilityState === 'visible') {
        void syncCvAndMaybeAnalyze();
      }
    };

    window.addEventListener('focus', onResume);
    document.addEventListener('visibilitychange', onResume);
    window.addEventListener('storage', (event) => {
      if (event.key === CV_DRAFT_STORAGE_KEY) {
        void syncCvAndMaybeAnalyze();
      }
    });

    return () => {
      window.removeEventListener('focus', onResume);
      document.removeEventListener('visibilitychange', onResume);
    };
  }, [syncCvAndMaybeAnalyze]);

  useEffect(() => {
    if (activeCvModeRef.current === 'imported') return;
    const resolved = resolveStudentCvSnapshot(profileInputFromUser(userRef.current));
    if (!resolved) return;
    const cvSource = resolved.source === 'profile_file' ? 'imported' : 'builder';
    void computeCvHashFromSnapshot(resolved.cv).then((cvHash) => {
      resolvedCvRef.current = {
        cv: resolved.cv,
        cvSource,
        cvFileName: resolved.fileName,
        cvHash,
      };
    });
  }, []);

  useEffect(() => {
    if (initialState !== 'success' || !canFetchDashboard || didFetchRef.current) return;
    didFetchRef.current = true;
    void loadDashboardRef.current();
  }, [initialState, canFetchDashboard]);

  const scrollToSection = useCallback((section: CvAnalysisNavSection) => {
    const el = document.getElementById(SECTION_IDS[section]);
    const scrollRoot = document.querySelector('main.admin-scroll');
    if (!el) return;

    navLockRef.current = true;
    if (navLockTimerRef.current !== null) {
      window.clearTimeout(navLockTimerRef.current);
    }
    setActiveSection(section);

    if (scrollRoot instanceof HTMLElement) {
      const rootRect = scrollRoot.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const top = elRect.top - rootRect.top + scrollRoot.scrollTop - 16;
      scrollRoot.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    navLockTimerRef.current = window.setTimeout(() => {
      navLockRef.current = false;
    }, 900);
  }, []);

  const reanalyze = useCallback(() => {
    const ctx = resolvedCvRef.current;
    if (!ctx) {
      void loadDashboard();
      return;
    }
    void runAnalysis(ctx.cv, {
      cvSource: ctx.cvSource,
      cvFileName: ctx.cvFileName,
      cvFileUrl: ctx.cvFileUrl,
      importedPreview: importedPreviewRef.current ?? undefined,
      force: true,
    });
  }, [loadDashboard, runAnalysis]);

  const openImportDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const importCvFile = useCallback(
    async (file: File) => {
      activeCvModeRef.current = 'imported';
      analysisInFlightRef.current = true;
      autoAnalyzeQueuedRef.current = true;
      clearCachedCvDashboard();
      setLoadError(null);

      const cvForAnalysis = cvSnapshotFromFileName(file.name);

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }

      revokeImportedCvPreview(importedPreviewRef.current);
      importedPreviewRef.current = null;

      setViewState('analyzing');
      setAnalysisStatus('processing');
      const emptyImported = buildEmptyDashboard(cvForAnalysis, {
        cvFileName: file.name,
        cvSource: 'imported',
        user: userRef.current,
      });
      setData({
        ...emptyImported,
        isDefaultCv: false,
        cvSnapshot: undefined,
        cvFileUrl: undefined,
        importedPreview: undefined,
        meta: {
          ...emptyImported.meta,
          analysisStatus: 'processing',
        },
      });

      const previewPromise = buildImportedCvPreview(file);

      try {
        const [cvHash, importedPreview] = await Promise.all([
          computeCvHashFromFile(file),
          previewPromise,
        ]);

        setImportedPreview(importedPreview);
        setData((prev) => (prev ? { ...prev, importedPreview } : prev));

        resolvedCvRef.current = {
          cv: cvForAnalysis,
          cvSource: 'imported',
          cvFileName: file.name,
          cvHash,
        };

        const outcome = await analyzeCvIntelligenceFileSafe(file);

        if (outcome.ok) {
          applyDashboardData(outcome.dashboard, cvForAnalysis, {
            cvFileName: file.name,
            cvSource: 'imported',
            importedPreview,
            status: outcome.status ?? 'up_to_date',
          });
        } else {
          setLoadError(outcome.error);
          setAnalysisStatus('failed');
          setViewState('error');
        }
      } catch {
        setLoadError('Impossible d\'analyser le CV importé.');
        setAnalysisStatus('failed');
        setViewState('error');
      } finally {
        analysisInFlightRef.current = false;
        autoAnalyzeQueuedRef.current = false;
      }
    },
    [applyDashboardData, setImportedPreview],
  );

  const handleImportFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (file) {
        void importCvFile(file);
      }
    },
    [importCvFile],
  );

  const simulateError = useCallback(() => {
    setViewState('error');
    setData(null);
    setAnalysisStatus('failed');
    setLoadError('Erreur lors de l\'analyse CV.');
  }, []);

  const retry = useCallback(() => {
    const ctx = resolvedCvRef.current;
    if (!ctx) {
      void loadDashboard();
      return;
    }
    void runAnalysis(ctx.cv, {
      cvSource: ctx.cvSource,
      cvFileName: ctx.cvFileName,
      cvFileUrl: ctx.cvFileUrl,
      importedPreview: importedPreviewRef.current ?? undefined,
      force: true,
    });
  }, [loadDashboard, runAnalysis]);

  const showEmpty = useCallback(() => {
    setViewState('empty');
    setData(null);
    setAnalysisStatus('none');
  }, []);

  const registerSectionObserver = useCallback(() => {
    observerRef.current?.disconnect();
    sectionRatiosRef.current.clear();

    const scrollRoot = document.querySelector('main.admin-scroll');
    const sections = Object.entries(SECTION_IDS).map(([key, id]) => ({
      key: key as CvAnalysisNavSection,
      el: document.getElementById(id),
    }));

    const pickActiveFromRatios = () => {
      if (navLockRef.current) return;

      let bestKey: CvAnalysisNavSection | null = null;
      let bestRatio = 0;

      for (const { key, el } of sections) {
        if (!el) continue;
        const ratio = sectionRatiosRef.current.get(el.id) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestKey = key;
        }
      }

      if (bestKey && bestRatio > 0) {
        setActiveSection(bestKey);
      }
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionRatiosRef.current.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        });
        pickActiveFromRatios();
      },
      {
        root: scrollRoot instanceof Element ? scrollRoot : null,
        rootMargin: '-10% 0px -55% 0px',
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
      },
    );

    sections.forEach(({ el }) => {
      if (el) observerRef.current?.observe(el);
    });
  }, []);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      if (navLockTimerRef.current !== null) {
        window.clearTimeout(navLockTimerRef.current);
      }
      revokeImportedCvPreview(importedPreviewRef.current);
      importedPreviewRef.current = null;
    },
    [],
  );

  return {
    viewState,
    data,
    analysisStatus,
    loadError,
    activeSection,
    expandedMatchId,
    setExpandedMatchId,
    expandedRecId,
    setExpandedRecId,
    scrollToSection,
    reanalyze,
    openImportDialog,
    fileInputRef,
    handleImportFileChange,
    simulateError,
    retry,
    showEmpty,
    registerSectionObserver,
    sectionIds: SECTION_IDS,
  };
}
