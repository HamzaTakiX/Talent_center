import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  analyzeCvBuilderSafe,
  fetchAnalysisConfig,
} from '../../../../cv/api/cvBuilderAnalysisApi';
import type { CvAnalysisDashboardData, CvAnalysisNavSection, DashboardViewState } from '../types/cvAnalysisDashboard';
import { readDefaultCvSnapshot, type CvBuilderSnapshot } from '../utils/cvDraftReader';
import {
  buildFallbackDashboard,
  mapBuilderAnalysisToDashboard,
} from '../utils/mapBuilderAnalysisToDashboard';

const SECTION_IDS: Record<CvAnalysisNavSection, string> = {
  upload: 'cva-section-upload',
  analysis: 'cva-section-analysis',
  compatibility: 'cva-section-compatibility',
  recommendations: 'cva-section-recommendations',
  skills: 'cva-section-skills',
  'ai-suggestions': 'cva-section-ai',
  interview: 'cva-section-interview',
  history: 'cva-section-career',
};

interface AnalyzeOptions {
  cvSource?: 'builder' | 'imported';
  cvFileName?: string;
}

interface UseCvAnalysisDashboardOptions {
  initialState?: DashboardViewState;
}

export function useCvAnalysisDashboard({
  initialState = 'success',
}: UseCvAnalysisDashboardOptions = {}) {
  const { i18n } = useTranslation();
  const [viewState, setViewState] = useState<DashboardViewState>(
    initialState === 'success' ? 'loading' : initialState,
  );
  const [data, setData] = useState<CvAnalysisDashboardData | null>(null);
  const [activeSection, setActiveSection] = useState<CvAnalysisNavSection>('analysis');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRatiosRef = useRef<Map<string, number>>(new Map());
  const navLockRef = useRef(false);
  const navLockTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = useCallback(
    async (cv: CvBuilderSnapshot, options: AnalyzeOptions = {}) => {
      setViewState('loading');
      setLoadError(null);

      try {
        const config = await fetchAnalysisConfig();
        let dashboardData: CvAnalysisDashboardData;

        if (config.ai_available) {
          const outcome = await analyzeCvBuilderSafe(cv as unknown as Record<string, unknown>);
          if (outcome.ok) {
            dashboardData = mapBuilderAnalysisToDashboard(cv, outcome.result, i18n.language, {
              cvFileName: options.cvFileName,
              cvSource: options.cvSource,
            });
          } else {
            dashboardData = buildFallbackDashboard(cv, {
              cvFileName: options.cvFileName,
              cvSource: options.cvSource,
            });
          }
        } else {
          dashboardData = buildFallbackDashboard(cv, {
            cvFileName: options.cvFileName,
            cvSource: options.cvSource,
          });
        }

        setData(dashboardData);
        setViewState('success');
        setActiveSection('analysis');
      } catch {
        setViewState('error');
        setData(null);
        setLoadError('Impossible de charger l\'analyse CV.');
      }
    },
    [i18n.language],
  );

  const loadDashboard = useCallback(async () => {
    const cv = readDefaultCvSnapshot();
    await runAnalysis(cv, { cvSource: 'builder' });
  }, [runAnalysis]);

  useEffect(() => {
    if (initialState !== 'success') return;
    void loadDashboard();
  }, [initialState, loadDashboard]);

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
    void loadDashboard();
  }, [loadDashboard]);

  const openImportDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const importCvFile = useCallback(
    async (file: File) => {
      const cv = readDefaultCvSnapshot();
      await runAnalysis(cv, { cvSource: 'imported', cvFileName: file.name });
    },
    [runAnalysis],
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
    setLoadError('Erreur lors de l\'analyse CV.');
  }, []);

  const retry = useCallback(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const showEmpty = useCallback(() => {
    setViewState('empty');
    setData(null);
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
    },
    [],
  );

  return {
    viewState,
    data,
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
