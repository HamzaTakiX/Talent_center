import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle2, ChevronDown, Target, TrendingUp } from 'lucide-react';
import type { CvRoadmapStep } from '../../types/cvAnalysisDashboard';
import { resolveDynamicLabel } from '../../utils/resolveDynamicLabel';
import {
  getRoadmapLayout,
  getRoadmapScoreGain,
  resolveRoadmapAction,
  type RoadmapLayout,
} from '../../utils/roadmapUtils';
import { fadeUp } from './CvAnalysisPrimitives';

interface ImprovementRoadmapProps {
  steps: CvRoadmapStep[];
}

interface RoadmapActionCardProps {
  step: CvRoadmapStep;
  variant?: 'featured' | 'compact' | 'timeline';
  showStepLabel?: boolean;
}

const RoadmapActionCard: FunctionComponent<RoadmapActionCardProps> = ({
  step,
  variant = 'compact',
  showStepLabel = false,
}) => {
  const { t } = useTranslation();
  const title = resolveDynamicLabel(t, step.titleKey, step.isDynamic ?? true);
  const description = step.description
    ? resolveDynamicLabel(t, step.description, step.isDynamic ?? true)
    : '';
  const scoreGain = getRoadmapScoreGain(step);
  const { actionKey, href } = resolveRoadmapAction(step);

  return (
    <article className={`sr-cva-roadmap-action sr-cva-roadmap-action--${variant}`}>
      <div className="sr-cva-roadmap-action__head">
        {variant === 'featured' ? (
          <span className="sr-cva-roadmap-action__icon" aria-hidden>
            <Target className="h-4 w-4" />
          </span>
        ) : null}
        <div className="sr-cva-roadmap-action__body">
          {showStepLabel ? (
            <p className="sr-cva-roadmap-action__step-label">
              {t('student.internshipOffers.cvDashboard.roadmap.step', { n: step.step })}
            </p>
          ) : null}
          <h4 className="sr-cva-roadmap-action__title">{title}</h4>
          {description ? <p className="sr-cva-roadmap-action__desc">{description}</p> : null}
        </div>
      </div>
      <div className="sr-cva-roadmap-action__footer">
        <span className="sr-cva-roadmap-action__gain">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          {t('student.internshipOffers.cvDashboard.roadmap.potentialGain', { points: scoreGain })}
        </span>
        <Link to={href} className="sr-cva-btn sr-cva-btn--primary sr-cva-roadmap-action__cta">
          {t(actionKey)}
        </Link>
      </div>
    </article>
  );
};

const RoadmapTimeline: FunctionComponent<{ steps: CvRoadmapStep[] }> = ({ steps }) => {
  const { t } = useTranslation();

  return (
    <div className="sr-cva-roadmap sr-cva-roadmap--timeline">
      {steps.map((step) => {
        const title = resolveDynamicLabel(t, step.titleKey, step.isDynamic ?? true);
        const description = step.description
          ? resolveDynamicLabel(t, step.description, step.isDynamic ?? true)
          : '';
        const scoreGain = getRoadmapScoreGain(step);
        const { actionKey, href } = resolveRoadmapAction(step);

        return (
          <div key={step.id} className="sr-cva-roadmap__step">
            <div className={`sr-cva-roadmap__dot${step.completed ? ' sr-cva-roadmap__dot--done' : ''}`}>
              {step.completed ? <Check className="h-3 w-3" aria-hidden /> : step.step}
            </div>
            <div className="sr-cva-roadmap__content">
              <p className="sr-cva-roadmap__step-label">
                {t('student.internshipOffers.cvDashboard.roadmap.step', { n: step.step })}
              </p>
              <p className="sr-cva-roadmap__title">{title}</p>
              {description ? <p className="sr-cva-roadmap__desc">{description}</p> : null}
              <div className="sr-cva-roadmap__meta">
                <span className="sr-cva-roadmap-action__gain">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                  {t('student.internshipOffers.cvDashboard.roadmap.potentialGain', { points: scoreGain })}
                </span>
                <Link to={href} className="sr-cva-btn sr-cva-btn--primary sr-cva-roadmap-action__cta">
                  {t(actionKey)}
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RoadmapCollapsible: FunctionComponent<{ steps: CvRoadmapStep[] }> = ({ steps }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const visibleCount = 3;
  const hiddenSteps = steps.slice(visibleCount);

  return (
    <div className="sr-cva-roadmap-collapsible">
      <RoadmapTimeline steps={steps.slice(0, visibleCount)} />
      {hiddenSteps.length > 0 ? (
        <>
          <button
            type="button"
            className="sr-cva-roadmap-collapsible__toggle"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            {expanded
              ? t('student.internshipOffers.cvDashboard.roadmap.showLess')
              : t('student.internshipOffers.cvDashboard.roadmap.showMore', { count: hiddenSteps.length })}
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                className="sr-cva-roadmap-collapsible__extra"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <RoadmapTimeline steps={hiddenSteps} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </div>
  );
};

const RoadmapEmptyState: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="sr-cva-roadmap-empty" role="status">
      <CheckCircle2 className="sr-cva-roadmap-empty__icon h-8 w-8" aria-hidden />
      <p className="sr-cva-roadmap-empty__title">
        {t('student.internshipOffers.cvDashboard.roadmap.emptyTitle')}
      </p>
      <p className="sr-cva-roadmap-empty__desc">
        {t('student.internshipOffers.cvDashboard.roadmap.emptyDesc')}
      </p>
    </div>
  );
};

function renderRoadmapContent(layout: RoadmapLayout, steps: CvRoadmapStep[]) {
  switch (layout) {
    case 'empty':
      return <RoadmapEmptyState />;
    case 'single':
      return <RoadmapActionCard step={steps[0]} variant="featured" />;
    case 'compact':
      return (
        <div className="sr-cva-roadmap-grid">
          {steps.map((step) => (
            <RoadmapActionCard key={step.id} step={step} variant="compact" showStepLabel />
          ))}
        </div>
      );
    case 'timeline':
      return <RoadmapTimeline steps={steps} />;
    case 'collapsible':
      return <RoadmapCollapsible steps={steps} />;
    default:
      return null;
  }
}

const ImprovementRoadmap: FunctionComponent<ImprovementRoadmapProps> = ({ steps }) => {
  const { t } = useTranslation();
  const layout = getRoadmapLayout(steps.length);

  return (
    <motion.div
      className={`sr-cva-glass sr-cva-section-card sr-cva-section-card--auto sr-cva-roadmap-card mt-4 sr-cva-roadmap-card--${layout}`}
      {...fadeUp}
    >
      <h3 className="sr-cva-section-title">{t('student.internshipOffers.cvDashboard.roadmap.title')}</h3>
      {renderRoadmapContent(layout, steps)}
    </motion.div>
  );
};

export default ImprovementRoadmap;
