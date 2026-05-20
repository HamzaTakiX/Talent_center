import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cvAiBridge } from '../../quickcv/cvAiBridge';
import type { BuilderAnalysisResult } from '../../types/cvAiAnalysis';
import { buildImprovements, scoreTone, sectionLabelKey } from '../../utils/cvAiPresentation';
import { collectStrengthInsights } from '../../utils/insightQuality';
import CvAiScoreRing from './CvAiScoreRing';
import CvAiRecommendationCard from './CvAiRecommendationCard';

const CvAiOverviewPanel: FunctionComponent = () => {
  const { t, i18n } = useTranslation();
  const [hasResult, setHasResult] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const [data, setData] = useState<BuilderAnalysisResult | null>(null);

  const autoOpenDone = useRef(false);

  useEffect(() => {
    const sync = () => {
      cvAiBridge.setLocale(i18n.language);
      const phase = cvAiBridge.phase;
      const ready = phase === 'done' && !!cvAiBridge.result;
      if (phase === 'analyzing' || phase === 'idle') {
        autoOpenDone.current = false;
      }
      if (ready && !autoOpenDone.current) {
        setPanelVisible(true);
        autoOpenDone.current = true;
      }
      setHasResult(ready);
      setData(cvAiBridge.result);
    };
    sync();
    const unsub = cvAiBridge.subscribe(sync);
    const onLang = (lng: string) => {
      cvAiBridge.setLocale(lng);
      sync();
    };
    i18n.on('languageChanged', onLang);
    return () => {
      unsub();
      i18n.off('languageChanged', onLang);
    };
  }, [i18n]);

  const overview = data?.overview;
  const strengths = useMemo(() => (data ? collectStrengthInsights(data) : []), [data]);
  const improvements = useMemo(
    () => (overview ? buildImprovements(overview, data) : []),
    [overview, data],
  );

  if (!overview || !hasResult) return null;

  return (
    <AnimatePresence mode="wait">
      {!panelVisible ? (
        <motion.button
          key="collapsed"
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="cv-ai-cockpit-pill pointer-events-auto fixed z-[56] bottom-6 right-4 sm:right-8"
          onClick={() => setPanelVisible(true)}
          aria-label={t('cv.ai.panel.show')}
        >
          <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="cv-ai-cockpit-pill__label">{t('cv.ai.overview.title')}</span>
          <span className="cv-ai-cockpit-pill__score">{overview.overall_score}</span>
          <ChevronUp className="h-4 w-4 shrink-0 opacity-70" strokeWidth={2} />
        </motion.button>
      ) : (
        <motion.div
          key="expanded"
          role="dialog"
          aria-label={t('cv.ai.overview.title')}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="cv-ai-cockpit cv-ai-cockpit--expanded pointer-events-auto fixed z-[56] inset-x-3 bottom-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:left-auto"
        >
          <div className="cv-ai-cockpit__surface">
            <header className="cv-ai-cockpit__header">
              <div className="cv-ai-cockpit__title-block">
                <span className="cv-ai-cockpit__pulse" aria-hidden />
                <div>
                  <h2 className="cv-ai-cockpit__title">{t('cv.ai.overview.title')}</h2>
                  <p className="cv-ai-cockpit__subtitle">{t('cv.ai.overview.subtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPanelVisible(false)}
                className="cv-ai-cockpit__close"
                aria-label={t('cv.ai.panel.hide')}
              >
                <ChevronDown className="h-4 w-4" strokeWidth={2} />
              </button>
            </header>

            <section className="cv-ai-cockpit__scores" aria-label={t('cv.ai.overview.scoresLabel')}>
              <CvAiScoreRing
                score={overview.overall_score}
                label={t('cv.ai.overview.overall')}
                size={84}
                tone={scoreTone(overview.overall_score)}
              />
              <CvAiScoreRing
                score={overview.ats_score}
                label={t('cv.ai.overview.ats')}
                size={76}
                tone={scoreTone(overview.ats_score)}
              />
              <div className="cv-ai-cockpit__readiness">
                <p className="cv-ai-cockpit__readiness-label">{t('cv.ai.overview.readiness')}</p>
                <p className="cv-ai-cockpit__readiness-text">{overview.internship_readiness}</p>
              </div>
            </section>

            {strengths.length > 0 && (
              <section className="cv-ai-cockpit__block cv-ai-cockpit__block--strengths">
                <h3 className="cv-ai-cockpit__block-title">{t('cv.ai.overview.strengthsTitle')}</h3>
                <p className="cv-ai-cockpit__block-meta">
                  {t('cv.ai.overview.strongest')}: {t(sectionLabelKey(overview.strongest_section))}
                </p>
                <ul className="cv-ai-cockpit__bullet-list">
                  {strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            )}

            {improvements.length > 0 && (
              <section className="cv-ai-cockpit__block cv-ai-cockpit__block--improve">
                <h3 className="cv-ai-cockpit__block-title">{t('cv.ai.overview.improvementsTitle')}</h3>
                <p className="cv-ai-cockpit__block-meta">
                  {t('cv.ai.overview.weakest')}: {t(sectionLabelKey(overview.weakest_section))}
                </p>
                <div className="cv-ai-cockpit__recs-list">
                  {improvements.map((item, index) => (
                    <CvAiRecommendationCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </section>
            )}

            <footer className="cv-ai-cockpit__footer">
              <p className="cv-ai-cockpit__meta">{overview.keyword_coverage}</p>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CvAiOverviewPanel;
