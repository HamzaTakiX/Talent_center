import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  Brain,
  CheckCircle2,
  Cloud,
  Layers,
  Layout,
  Palette,
  Server,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  CONFIG_ROLE_OPTIONS,
  DIFFICULTY_META,
  DURATION_INTENSITY_KEYS,
  LANGUAGE_FLAG,
  LANGUAGE_FLUENCY_KEYS,
  QUESTIONS_BY_LENGTH,
} from '../../../data/interviewConfigMock';
import type {
  InterviewDifficulty,
  InterviewLanguage,
  InterviewLength,
  SimulatorConfig,
} from '../../../types/interviewSimulatorDashboard';
import {
  estimatedQuestions,
  expectedScoreRange,
  interviewerPreview,
  interviewerTypeKey,
  preparationLabelKey,
} from '../../../utils/interviewConfigDerived';

const ROLE_ICONS = {
  layout: Layout,
  server: Server,
  layers: Layers,
  chart: BarChart2,
  brain: Brain,
  palette: Palette,
  cloud: Cloud,
} as const;

const DIFFICULTIES: InterviewDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const LENGTHS: InterviewLength[] = [5, 10, 15, 20, 30];
const LANGUAGES: InterviewLanguage[] = ['en', 'fr', 'ar'];

const stepMotion = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
};

interface StepProps {
  config: SimulatorConfig;
  isCustom: boolean;
  onConfigChange: (patch: Partial<SimulatorConfig>) => void;
}

export const StepRole: FunctionComponent<StepProps> = ({ config, isCustom, onConfigChange }) => {
  const { t } = useTranslation();

  return (
    <motion.div className="sr-is-config-step" {...stepMotion}>
      <header className="sr-is-config-step__header">
        <h2 className="sr-is-config-step__title">{t('student.internshipOffers.interviewSim.config.role.title')}</h2>
        <p className="sr-is-config-step__subtitle">{t('student.internshipOffers.interviewSim.config.role.subtitle')}</p>
      </header>

      {isCustom ? (
        <div className="sr-is-config-custom-form">
          <input
            className="sr-is-select"
            placeholder={t('student.internshipOffers.interviewSim.config.jobTitle')}
            value={config.customJobTitle ?? ''}
            onChange={(e) => onConfigChange({ customJobTitle: e.target.value })}
          />
          <input
            className="sr-is-select"
            placeholder={t('student.internshipOffers.interviewSim.config.company')}
            value={config.customCompany ?? ''}
            onChange={(e) => onConfigChange({ customCompany: e.target.value })}
          />
          <textarea
            className="sr-is-textarea"
            placeholder={t('student.internshipOffers.interviewSim.config.description')}
            value={config.customDescription ?? ''}
            onChange={(e) => onConfigChange({ customDescription: e.target.value })}
            rows={4}
          />
        </div>
      ) : (
        <div className="sr-is-config-role-grid">
          {CONFIG_ROLE_OPTIONS.map((role) => {
            const Icon = ROLE_ICONS[role.icon];
            const selected = config.role === role.value;
            return (
              <button
                key={role.id}
                type="button"
                className={['sr-is-config-role-card', selected && 'sr-is-config-role-card--active'].filter(Boolean).join(' ')}
                onClick={() => onConfigChange({ role: role.value })}
              >
                <div className="sr-is-config-role-card__top">
                  <span className="sr-is-config-role-card__icon">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  {role.badgeKey ? <span className="sr-is-config-role-card__badge">{t(role.badgeKey)}</span> : null}
                </div>
                <h3 className="sr-is-config-role-card__title">{t(role.titleKey)}</h3>
                <p className="sr-is-config-role-card__desc">{t(role.descKey)}</p>
                <span className="sr-is-config-role-card__level">{t(role.levelKey)}</span>
                {selected ? <CheckCircle2 className="sr-is-config-role-card__check" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export const StepDifficulty: FunctionComponent<StepProps> = ({ config, onConfigChange }) => {
  const { t } = useTranslation();

  return (
    <motion.div className="sr-is-config-step" {...stepMotion}>
      <header className="sr-is-config-step__header">
        <h2 className="sr-is-config-step__title">{t('student.internshipOffers.interviewSim.config.difficultyMeta.title')}</h2>
        <p className="sr-is-config-step__subtitle">{t('student.internshipOffers.interviewSim.config.difficultyMeta.subtitle')}</p>
      </header>
      <div className="sr-is-config-difficulty-grid">
        {DIFFICULTIES.map((d) => {
          const meta = DIFFICULTY_META[d];
          const selected = config.difficulty === d;
          return (
            <button
              key={d}
              type="button"
              className={['sr-is-config-difficulty-card', selected && 'sr-is-config-difficulty-card--active'].filter(Boolean).join(' ')}
              onClick={() => onConfigChange({ difficulty: d })}
            >
              <span className="sr-is-config-difficulty-card__label">
                {t(`student.internshipOffers.interviewSim.config.difficulty.${d}`)}
              </span>
              <ul className="sr-is-config-difficulty-card__meta">
                <li>{t(meta.levelKey)}</li>
                <li>{t(meta.complexityKey)}</li>
                <li>{t(meta.scoringKey)}</li>
              </ul>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export const StepDuration: FunctionComponent<StepProps> = ({ config, onConfigChange }) => {
  const { t } = useTranslation();

  return (
    <motion.div className="sr-is-config-step" {...stepMotion}>
      <header className="sr-is-config-step__header">
        <h2 className="sr-is-config-step__title">{t('student.internshipOffers.interviewSim.config.duration.title')}</h2>
        <p className="sr-is-config-step__subtitle">{t('student.internshipOffers.interviewSim.config.duration.subtitle')}</p>
      </header>
      <div className="sr-is-config-duration-grid">
        {LENGTHS.map((len) => {
          const selected = config.length === len;
          const questions = QUESTIONS_BY_LENGTH[len];
          return (
            <button
              key={len}
              type="button"
              className={['sr-is-config-duration-card', selected && 'sr-is-config-duration-card--active'].filter(Boolean).join(' ')}
              onClick={() => onConfigChange({ length: len })}
            >
              <span className="sr-is-config-duration-card__time">{len}</span>
              <span className="sr-is-config-duration-card__unit">min</span>
              <p className="sr-is-config-duration-card__questions">
                {t('student.internshipOffers.interviewSim.config.duration.questions', { count: questions })}
              </p>
              <p className="sr-is-config-duration-card__intensity">{t(DURATION_INTENSITY_KEYS[len])}</p>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export const StepLanguage: FunctionComponent<StepProps> = ({ config, onConfigChange }) => {
  const { t } = useTranslation();

  return (
    <motion.div className="sr-is-config-step" {...stepMotion}>
      <header className="sr-is-config-step__header">
        <h2 className="sr-is-config-step__title">{t('student.internshipOffers.interviewSim.config.language.title')}</h2>
        <p className="sr-is-config-step__subtitle">{t('student.internshipOffers.interviewSim.config.language.subtitle')}</p>
      </header>
      <div className="sr-is-config-language-grid">
        {LANGUAGES.map((lang) => {
          const selected = config.language === lang;
          return (
            <button
              key={lang}
              type="button"
              className={['sr-is-config-language-card', selected && 'sr-is-config-language-card--active'].filter(Boolean).join(' ')}
              onClick={() => onConfigChange({ language: lang })}
            >
              <span className="sr-is-config-language-card__flag" aria-hidden>
                {LANGUAGE_FLAG[lang]}
              </span>
              <h3 className="sr-is-config-language-card__title">
                {t(`student.internshipOffers.interviewSim.config.language.${lang}`)}
              </h3>
              <p className="sr-is-config-language-card__fluency">
                {t('student.internshipOffers.interviewSim.config.language.fluencyLabel')}: {t(LANGUAGE_FLUENCY_KEYS[lang])}
              </p>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export const StepReview: FunctionComponent<StepProps> = ({ config }) => {
  const { t } = useTranslation();
  const questions = estimatedQuestions(config.length);
  const [scoreMin, scoreMax] = expectedScoreRange(config.difficulty);
  const interviewer = interviewerPreview(config);

  const summaryRows = [
    { label: t('student.internshipOffers.interviewSim.config.review.labels.role'), value: config.role },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.difficulty'),
      value: t(`student.internshipOffers.interviewSim.config.difficulty.${config.difficulty}`),
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.duration'),
      value: `${config.length} min`,
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.language'),
      value: t(`student.internshipOffers.interviewSim.config.language.${config.language}`),
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.questions'),
      value: String(questions),
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.scoreRange'),
      value: `${scoreMin}–${scoreMax}%`,
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.preparation'),
      value: t(preparationLabelKey()),
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.interviewerType'),
      value: t(interviewerTypeKey(config)),
    },
  ];

  return (
    <motion.div className="sr-is-config-step sr-is-config-step--review" {...stepMotion}>
      <header className="sr-is-config-step__header">
        <h2 className="sr-is-config-step__title">{t('student.internshipOffers.interviewSim.config.review.title')}</h2>
        <p className="sr-is-config-step__subtitle">{t('student.internshipOffers.interviewSim.config.review.subtitle')}</p>
      </header>

      <div className="sr-is-config-review-grid">
        <div className="sr-is-config-review-summary sr-is-panel">
          <h3 className="sr-is-config-review-summary__title">{t('student.internshipOffers.interviewSim.config.review.summaryTitle')}</h3>
          <dl className="sr-is-config-review-summary__list">
            {summaryRows.map((row) => (
              <div key={row.label} className="sr-is-config-review-summary__row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="sr-is-config-review-interviewer sr-is-panel">
          <div className="sr-is-config-review-interviewer__glow" aria-hidden />
          <p className="sr-is-config-review-interviewer__eyebrow">
            <Sparkles className="h-4 w-4" aria-hidden />
            {t('student.internshipOffers.interviewSim.config.review.aiPreview')}
          </p>
          <div className="sr-is-config-review-interviewer__avatar">
            <UserRound className="h-8 w-8" aria-hidden />
          </div>
          <h3 className="sr-is-config-review-interviewer__name">{interviewer.title}</h3>
          <dl className="sr-is-config-review-interviewer__meta">
            <div>
              <dt>{t('student.internshipOffers.interviewSim.config.review.experience')}</dt>
              <dd>{interviewer.experienceYears} {t('student.internshipOffers.interviewSim.config.review.years')}</dd>
            </div>
            <div>
              <dt>{t('student.internshipOffers.interviewSim.config.review.interviewStyle')}</dt>
              <dd>{t(interviewer.styleKey)}</dd>
            </div>
            <div>
              <dt>{t('student.internshipOffers.interviewSim.config.review.labels.difficulty')}</dt>
              <dd>{t(`student.internshipOffers.interviewSim.config.difficulty.${config.difficulty}`)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </motion.div>
  );
};
