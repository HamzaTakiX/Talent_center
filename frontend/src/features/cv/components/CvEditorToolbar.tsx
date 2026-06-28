import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Download, Loader2, Save, Sparkles, ZoomIn } from 'lucide-react';
import {
  clearOnboardingCvPending,
  isOnboardingCvPending,
} from '../../auth/utils/onboardingCvGate';
import { STUDENT_DASHBOARD_PATH } from '../../student/config/studentNavConfig';
import { CV_DRAFT_STORAGE_KEY } from '../../student/internship_offers/CV_Analyse/utils/cvDraftReader';
import {
  quickCvDemoClear,
  quickCvDemoFill,
  quickCvDownloadPdf,
  quickCvUiBridge,
  type QuickCvViewMode,
} from '../quickcv/quickcvUiBridge';
import { cvAiBridge, requestCvAiAnalysis, requestCvSave } from '../quickcv/cvAiBridge';
import {
  STUDENT_PRIMARY_BUTTON,
  STUDENT_TEXT_SECONDARY,
} from '../../student/design-system/studentTokens';

const VIEW_MODES: { id: QuickCvViewMode; labelKey: string }[] = [
  { id: 'split', labelKey: 'cv.toolbar.split' },
  { id: 'tab', labelKey: 'cv.toolbar.tabbed' },
];

const CvEditorToolbar: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onboardingCv = isOnboardingCvPending();
  const [mode, setMode] = useState<QuickCvViewMode>(quickCvUiBridge.mode);
  const [scale, setScale] = useState(quickCvUiBridge.viewScale);
  const [demoOn, setDemoOn] = useState(() => {
    try {
      return !localStorage.getItem(CV_DRAFT_STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const [aiBusy, setAiBusy] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const sync = () => {
      setMode(quickCvUiBridge.mode);
      setScale(quickCvUiBridge.viewScale);
    };
    sync();
    return quickCvUiBridge.subscribe(sync);
  }, []);

  useEffect(() => {
    const syncAi = () => setAiBusy(cvAiBridge.phase === 'analyzing');
    syncAi();
    const unsub = cvAiBridge.subscribe(syncAi);
    return unsub;
  }, []);

  useEffect(() => {
    const onSaved = (e: Event) => {
      const ok = (e as CustomEvent<{ ok?: boolean }>).detail?.ok !== false;
      setSaveError(!ok);
      if (ok) {
        setSaveSucceeded(true);
      } else {
        setSaveSucceeded(false);
      }
    };
    window.addEventListener('quickcv:save-done', onSaved);
    return () => window.removeEventListener('quickcv:save-done', onSaved);
  }, []);

  const setViewMode = (next: QuickCvViewMode) => {
    quickCvUiBridge.mode = next;
    setMode(next);
  };

  const onScaleChange = (value: number) => {
    quickCvUiBridge.viewScale = value;
    setScale(value);
  };

  const onDemoChange = (checked: boolean) => {
    setDemoOn(checked);
    if (checked) quickCvDemoFill();
    else quickCvDemoClear();
  };

  const goToDashboard = () => {
    clearOnboardingCvPending();
    navigate(STUDENT_DASHBOARD_PATH, { replace: true });
  };

  const showContinue = saveSucceeded && onboardingCv;
  const showPortalLink = !onboardingCv;

  return (
    <div className="quickcv-toolbar-admin flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-2.5 max-sm:grid max-sm:grid-cols-1 max-sm:gap-2 max-sm:px-3 max-sm:py-2 sm:px-6">
      {showPortalLink && (
        <Link
          to={STUDENT_DASHBOARD_PATH}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-3 py-2 text-xs font-semibold ${STUDENT_TEXT_SECONDARY} transition-colors hover:border-[var(--admin-brand)] hover:bg-[var(--admin-brand-muted)] hover:text-[var(--admin-brand)] max-sm:w-full max-sm:justify-center`}
        >
          {t('cv.editor.back')}
        </Link>
      )}
      <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-inset)] px-3 py-1.5 max-sm:w-full">
        <ZoomIn className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" aria-hidden />
        <input
          type="range"
          min={1}
          max={100}
          value={scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="quickcv-zoom-range h-2 w-24 min-w-[5rem] max-w-[7rem] cursor-pointer sm:w-28"
          aria-label={t('cv.toolbar.zoom')}
        />
        <span className={`w-10 shrink-0 text-right text-xs font-semibold tabular-nums ${STUDENT_TEXT_SECONDARY}`}>
          {scale}%
        </span>
      </div>

      <label
        className="admin-toggle-row flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-[var(--admin-border)] hover:bg-[var(--admin-brand-muted)] max-sm:w-full max-sm:justify-between"
      >
        <span className={`text-sm font-medium ${STUDENT_TEXT_SECONDARY}`}>
          {t('cv.toolbar.demo')}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={demoOn}
          onClick={() => onDemoChange(!demoOn)}
          className={`admin-toggle relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-brand)] ${
            demoOn ? 'admin-toggle--on' : 'admin-toggle--off'
          }`}
        >
          <span
            className={`admin-toggle-thumb absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] duration-300 ${
              demoOn ? 'left-[calc(100%-1.25rem-0.25rem)]' : 'left-1'
            }`}
          />
        </button>
      </label>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.02, duration: 0.2 }}
        role="group"
        aria-label={t('cv.toolbar.viewMode')}
        className="admin-lang-switch inline-flex shrink-0 items-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-0.5 shadow-sm max-sm:w-full"
      >
        {VIEW_MODES.map(({ id, labelKey }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setViewMode(id)}
              aria-pressed={active}
              className="relative z-0 min-w-[3.25rem] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold leading-none tracking-wide transition-colors max-sm:flex-1 max-sm:min-w-0 sm:min-w-[3.75rem] sm:px-3 sm:text-xs"
            >
              {active && (
                <motion.span
                  layoutId="cv-toolbar-view-pill"
                  className="absolute inset-0 rounded-lg bg-[var(--admin-brand)] shadow-sm"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  aria-hidden
                />
              )}
              <span
                className={`relative z-[1] ${
                  active
                    ? 'text-white'
                    : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]'
                }`}
              >
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </motion.div>

      <span className="hidden min-w-2 flex-1 sm:block" />

      <button
        type="button"
        onClick={() => {
          setSaveError(false);
          setSaveSucceeded(false);
          requestCvSave();
        }}
        className={`quickcv-save-btn inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition-colors max-sm:w-full max-sm:justify-center ${
          saveError
            ? 'quickcv-save-btn--error'
            : saveSucceeded
              ? 'quickcv-save-btn--saved'
              : 'quickcv-save-btn--default'
        }`}
      >
        <Save className="h-4 w-4" />
        {saveError
          ? t('cv.editor.actions.saveError')
          : saveSucceeded
            ? t('cv.editor.actions.saved')
            : t('cv.editor.actions.save')}
      </button>

      <AnimatePresence>
        {showContinue && (
          <motion.button
            key="cv-continue-dashboard"
            type="button"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.22 }}
            onClick={goToDashboard}
            className={`${STUDENT_PRIMARY_BUTTON} inline-flex shrink-0 items-center gap-2 max-sm:w-full max-sm:justify-center`}
          >
            <span>{t('cv.editor.actions.continueDashboard')}</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => requestCvAiAnalysis()}
        disabled={aiBusy}
        className="cv-ai-analyze-btn inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-60 max-sm:w-full max-sm:justify-center"
      >
        {aiBusy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {t('cv.editor.actions.analyze')}
      </button>

      <button
        type="button"
        onClick={() => quickCvDownloadPdf()}
        className={`${STUDENT_PRIMARY_BUTTON} inline-flex shrink-0 items-center gap-2 max-sm:w-full max-sm:justify-center`}
      >
        <Download className="h-4 w-4" />
        {t('cv.toolbar.download')}
      </button>
    </div>
  );
};

export default CvEditorToolbar;
