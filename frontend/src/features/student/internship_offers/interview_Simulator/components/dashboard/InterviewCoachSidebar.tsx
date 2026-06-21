import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bot, Lightbulb, RefreshCw, Wand2 } from 'lucide-react';
import { COACH_SUGGESTIONS } from '../../data/interviewSimulatorDashboardMock';
import WeakSkillsPanel from './WeakSkillsPanel';
import { fadeUp } from './InterviewPrimitives';

interface InterviewCoachSidebarProps {
  onQuickAction?: (action: string) => void;
  className?: string;
}

const QUICK_ACTIONS = [
  { key: 'student.internshipOffers.interviewSim.coach.generateAnswer', icon: Wand2 },
  { key: 'student.internshipOffers.interviewSim.coach.improveAnswer', icon: Lightbulb },
  { key: 'student.internshipOffers.interviewSim.coach.explainQuestion', icon: Lightbulb },
  { key: 'student.internshipOffers.interviewSim.coach.practiceAgain', icon: RefreshCw },
];

const InterviewCoachSidebar: FunctionComponent<InterviewCoachSidebarProps> = ({
  onQuickAction,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <aside className={`sr-is-coach ${className}`}>
      <WeakSkillsPanel compact />

      <motion.div className="sr-is-panel sr-is-coach__card" {...fadeUp} transition={{ delay: 0.05 }}>
        <div className="mb-3 flex items-center gap-2.5">
          <div className="sr-is-coach__avatar">
            <Bot className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h3 className="m-0 text-sm font-semibold text-[var(--admin-text)]">
              {t('student.internshipOffers.interviewSim.coach.title')}
            </h3>
            <p className="m-0 text-xs text-[var(--admin-text-muted)]">
              {t('student.internshipOffers.interviewSim.coach.subtitle')}
            </p>
          </div>
        </div>

        <p className="sr-is-coach__section-label">
          {t('student.internshipOffers.interviewSim.coach.suggestedPractice')}
        </p>
        <ul className="sr-is-coach__list">
          {COACH_SUGGESTIONS.map((s) => (
            <li key={s.id} role="button" tabIndex={0} onClick={() => onQuickAction?.(t(s.labelKey))}>
              {t(s.labelKey)}
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div className="sr-is-panel sr-is-coach__card" {...fadeUp} transition={{ delay: 0.08 }}>
        <p className="sr-is-coach__section-label">{t('student.internshipOffers.interviewSim.coach.quickActions')}</p>
        <div className="flex flex-col gap-1.5">
          {QUICK_ACTIONS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className="sr-is-btn sr-is-btn--secondary w-full justify-start text-xs"
              onClick={() => onQuickAction?.(t(key))}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {t(key)}
            </button>
          ))}
        </div>
      </motion.div>
    </aside>
  );
};

export default InterviewCoachSidebar;
