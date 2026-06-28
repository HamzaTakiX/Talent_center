import { FunctionComponent } from 'react';
import { Target } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BASIS_SIDEBAR_PREVIEW,
  DEFAULT_SIDEBAR_PREVIEW,
} from '../../../data/interviewConfigMock';
import type { SimulationBasis } from '../../../types/interviewSimulatorDashboard';
import { CircularScore, ScoreBar } from '../InterviewPrimitives';

interface InterviewConfigSidebarProps {
  basis?: SimulationBasis;
}

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
};

const InterviewConfigSidebar: FunctionComponent<InterviewConfigSidebarProps> = ({ basis }) => {
  const { t } = useTranslation();
  const preview = basis ? BASIS_SIDEBAR_PREVIEW[basis] : DEFAULT_SIDEBAR_PREVIEW;
  const showPlaceholder = !basis;

  return (
    <aside className="sr-is-config-sidebar">
      <AnimatePresence mode="wait">
        <motion.div
          key={basis ?? 'default'}
          className="sr-is-config-sidebar__stack"
          {...panelMotion}
        >
          <div
            className={[
              'sr-is-config-sidebar__card',
              'sr-is-config-sidebar__card--readiness',
              showPlaceholder && 'sr-is-config-sidebar__card--placeholder',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <h3 className="sr-is-config-sidebar__title">
              {t('student.internshipOffers.interviewSim.config.sidebar.readiness')}
            </h3>
            <div className="sr-is-config-sidebar__readiness">
              <CircularScore key={basis ?? 'default'} score={preview.readinessScore} size={120} />
              <p className="sr-is-config-sidebar__readiness-caption">
                {showPlaceholder
                  ? t('student.internshipOffers.interviewSim.config.sidebar.readinessCaptionEmpty')
                  : t(preview.captionKey)}
              </p>
            </div>
          </div>

          <div
            className={[
              'sr-is-config-sidebar__card',
              showPlaceholder && 'sr-is-config-sidebar__card--placeholder',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <h3 className="sr-is-config-sidebar__title">
              <Target className="h-4 w-4" aria-hidden />
              {t('student.internshipOffers.interviewSim.config.sidebar.skillsTitle')}
            </h3>
            <ul className="sr-is-config-sidebar__skills">
              {preview.skills.map((skill, index) => (
                <li key={`${basis ?? 'default'}-${skill.labelKey}`}>
                  <span>{t(skill.labelKey)}</span>
                  <ScoreBar
                    score={showPlaceholder ? Math.max(skill.score - 18, 40) : skill.score}
                    delay={index * 0.08}
                  />
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
};

export default InterviewConfigSidebar;
