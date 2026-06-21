import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, Minus, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { WEAK_SKILLS_DETAILED } from '../../data/interviewSimulatorDashboardMock';
import type { WeakSkillDetail } from '../../types/interviewSimulatorDashboard';
import { fadeUp } from './InterviewPrimitives';

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

interface WeakSkillRowProps {
  skill: WeakSkillDetail;
  expanded: boolean;
  onToggle: () => void;
}

const WeakSkillRow: FunctionComponent<WeakSkillRowProps> = ({ skill, expanded, onToggle }) => {
  const { t } = useTranslation();
  const TrendIcon = TREND_ICONS[skill.trend];
  const severityClass =
    skill.score < 50 ? 'critical' : skill.score < 70 ? 'warning' : 'stable';

  return (
    <div className={`sr-is-weak-skill sr-is-weak-skill--${severityClass}`}>
      <button type="button" className="sr-is-weak-skill__trigger" onClick={onToggle}>
        <div className="sr-is-weak-skill__main">
          <div className="sr-is-weak-skill__name-row">
            <span className="sr-is-weak-skill__name">{skill.name}</span>
            <span className={`sr-is-weak-skill__priority sr-is-weak-skill__priority--${skill.priority}`}>
              {t(`student.internshipOffers.interviewSim.weakSkills.priority.${skill.priority}`)}
            </span>
          </div>
          <span className="sr-is-weak-skill__status">{t(skill.statusKey)}</span>
          <div className="sr-is-weak-skill__progress-wrap">
            <div className="sr-is-weak-skill__progress">
              <motion.div
                className="sr-is-weak-skill__progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${skill.score}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="sr-is-weak-skill__score">{skill.score}%</span>
          </div>
        </div>
        <div className="sr-is-weak-skill__meta">
          <span className={`sr-is-weak-skill__trend sr-is-weak-skill__trend--${skill.trend}`}>
            <TrendIcon className="h-3 w-3" aria-hidden />
            {skill.trend !== 'flat' && (
              <span>{skill.trend === 'up' ? '+' : '-'}{skill.trendDelta}%</span>
            )}
          </span>
          <ChevronDown className={`sr-is-weak-skill__chevron${expanded ? ' sr-is-weak-skill__chevron--open' : ''}`} aria-hidden />
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="sr-is-weak-skill__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="sr-is-weak-skill__suggestion">{t(skill.suggestionKey)}</p>
            <button type="button" className="sr-is-btn sr-is-btn--secondary sr-is-weak-skill__action">
              {t('student.internshipOffers.interviewSim.weakSkills.practice')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface WeakSkillsPanelProps {
  compact?: boolean;
}

const WeakSkillsPanel: FunctionComponent<WeakSkillsPanelProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(WEAK_SKILLS_DETAILED[0]?.id ?? null);
  const atRisk = WEAK_SKILLS_DETAILED.filter((s) => s.score < 60).length;

  return (
    <motion.div className={`sr-is-panel sr-is-weak-skills${compact ? ' sr-is-weak-skills--compact' : ''}`} {...fadeUp}>
      <div className="sr-is-weak-skills__header">
        <div>
          <h3 className="sr-is-weak-skills__title">
            <Target className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.interviewSim.weakSkills.title')}
          </h3>
          <p className="sr-is-weak-skills__subtitle">{t('student.internshipOffers.interviewSim.weakSkills.subtitle')}</p>
        </div>
        {atRisk > 0 && (
          <span className="sr-is-weak-skills__risk-badge">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            {t('student.internshipOffers.interviewSim.weakSkills.atRisk', { count: atRisk })}
          </span>
        )}
      </div>

      <div className="sr-is-weak-skills__list">
        {WEAK_SKILLS_DETAILED.map((skill) => (
          <WeakSkillRow
            key={skill.id}
            skill={skill}
            expanded={expandedId === skill.id}
            onToggle={() => setExpandedId((id) => (id === skill.id ? null : skill.id))}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default WeakSkillsPanel;
