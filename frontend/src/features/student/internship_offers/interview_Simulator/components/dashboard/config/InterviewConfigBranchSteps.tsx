import { FunctionComponent, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Link2,
  Loader2,
  PenLine,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DIFFICULTY_META,
  DURATION_INTENSITY_KEYS,
  LANGUAGE_FLAG,
  LANGUAGE_FLUENCY_KEYS,
  QUESTIONS_BY_LENGTH,
} from '../../../data/interviewConfigMock';
import { useSimulatorOfferImport } from '../../../hooks/useSimulatorOfferImport';
import SimulatorOfferExtractedPreview from './SimulatorOfferExtractedPreview';
import type {
  ExperienceLevel,
  InterviewDifficulty,
  InterviewFocusType,
  InterviewLanguage,
  InterviewLength,
  InterviewerGender,
  OfferInputMode,
  SimulationBasis,
  SimulatorConfig,
} from '../../../types/interviewSimulatorDashboard';

const stepMotion = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
};

interface StepProps {
  config: SimulatorConfig;
  onConfigChange: (patch: Partial<SimulatorConfig>) => void;
}

const DIFFICULTIES: InterviewDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const LENGTHS: InterviewLength[] = [5, 10, 15, 20, 30];
const LANGUAGES: InterviewLanguage[] = ['en', 'fr', 'ar'];
const EXPERIENCE_LEVELS: ExperienceLevel[] = ['intern', 'junior', 'mid', 'senior'];

function focusOptionsForBasis(_basis?: SimulationBasis): InterviewFocusType[] {
  return ['hr', 'technical', 'mixed'];
}

const FOCUS_META: Record<
  InterviewFocusType,
  { icon: typeof Users; titleKey: string; descKey: string; benefitsKeys: string[] }
> = {
  hr: {
    icon: Users,
    titleKey: 'student.internshipOffers.interviewSim.config.interviewType.hr.title',
    descKey: 'student.internshipOffers.interviewSim.config.interviewType.hr.desc',
    benefitsKeys: [
      'student.internshipOffers.interviewSim.config.interviewType.hr.b1',
      'student.internshipOffers.interviewSim.config.interviewType.hr.b2',
      'student.internshipOffers.interviewSim.config.interviewType.hr.b3',
    ],
  },
  technical: {
    icon: Brain,
    titleKey: 'student.internshipOffers.interviewSim.config.interviewType.technical.title',
    descKey: 'student.internshipOffers.interviewSim.config.interviewType.technical.desc',
    benefitsKeys: [
      'student.internshipOffers.interviewSim.config.interviewType.technical.b1',
      'student.internshipOffers.interviewSim.config.interviewType.technical.b2',
      'student.internshipOffers.interviewSim.config.interviewType.technical.b3',
    ],
  },
  mixed: {
    icon: Sparkles,
    titleKey: 'student.internshipOffers.interviewSim.config.interviewType.mixed.title',
    descKey: 'student.internshipOffers.interviewSim.config.interviewType.mixed.desc',
    benefitsKeys: [
      'student.internshipOffers.interviewSim.config.interviewType.mixed.b1',
      'student.internshipOffers.interviewSim.config.interviewType.mixed.b2',
      'student.internshipOffers.interviewSim.config.interviewType.mixed.b3',
    ],
  },
};

export const StepInterviewType: FunctionComponent<StepProps> = ({ config, onConfigChange }) => {
  const { t } = useTranslation();
  const options = focusOptionsForBasis(config.basis);

  return (
    <motion.div className="sr-is-config-step" {...stepMotion}>
      <header className="sr-is-config-step__header">
        <h2 className="sr-is-config-step__title">
          {t('student.internshipOffers.interviewSim.config.interviewType.title')}
        </h2>
        <p className="sr-is-config-step__subtitle">
          {config.basis === 'offer'
            ? t('student.internshipOffers.interviewSim.config.interviewType.subtitleOffer')
            : t('student.internshipOffers.interviewSim.config.interviewType.subtitlePersonal')}
        </p>
      </header>

      <div className="sr-is-config-basis-grid">
        {options.map((focus) => {
          const meta = FOCUS_META[focus];
          const Icon = meta.icon;
          const selected = config.interviewFocus === focus;
          return (
            <button
              key={focus}
              type="button"
              className={['sr-is-config-basis-card', selected && 'sr-is-config-basis-card--active']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onConfigChange({ interviewFocus: focus })}
            >
              <div className="sr-is-config-basis-card__top">
                <span className="sr-is-config-basis-card__icon">
                  <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
                </span>
                {selected && <CheckCircle2 className="sr-is-config-basis-card__check h-5 w-5" aria-hidden />}
              </div>
              <h3 className="sr-is-config-basis-card__title">{t(meta.titleKey)}</h3>
              <p className="sr-is-config-basis-card__desc">{t(meta.descKey)}</p>
              <ul className="sr-is-config-basis-card__benefits">
                {meta.benefitsKeys.map((key) => (
                  <li key={key}>
                    <Sparkles className="h-3 w-3" aria-hidden />
                    {t(key)}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

const OFFER_MODE_OPTIONS: { id: OfferInputMode; icon: typeof Link2; titleKey: string; descKey: string }[] = [
  {
    id: 'url',
    icon: Link2,
    titleKey: 'student.internshipOffers.interviewSim.config.offerData.url.title',
    descKey: 'student.internshipOffers.interviewSim.config.offerData.url.desc',
  },
  {
    id: 'manual',
    icon: PenLine,
    titleKey: 'student.internshipOffers.interviewSim.config.offerData.manual.title',
    descKey: 'student.internshipOffers.interviewSim.config.offerData.manual.desc',
  },
];

export const StepOfferData: FunctionComponent<StepProps> = ({ config, onConfigChange }) => {
  const { t } = useTranslation();
  const { loading, error, setError, extractFromUrl } = useSimulatorOfferImport();
  const [extracted, setExtracted] = useState(!!config.extractedOfferPreview);
  const mode = config.offerInputMode ?? 'url';

  const handleModeChange = (next: OfferInputMode) => {
    setExtracted(false);
    setError(null);
    onConfigChange({
      offerInputMode: next,
      offerUrl: undefined,
      offerImportJobUuid: undefined,
      extractedOfferPreview: undefined,
      customJobTitle: undefined,
      customCompany: undefined,
      customDescription: undefined,
    });
  };

  const handleExtract = async () => {
    if (!config.offerUrl?.trim()) return;
    try {
      const data = await extractFromUrl(config.offerUrl);
      onConfigChange({
        customJobTitle: data.customJobTitle,
        customCompany: data.customCompany,
        customDescription: data.customDescription,
        extractedOfferPreview: data.preview,
        offerUrl: config.offerUrl,
      });
      setExtracted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('student.internshipOffers.interviewSim.config.offerData.extractError'));
      setExtracted(false);
    }
  };

  return (
    <motion.div className="sr-is-config-step sr-is-config-step--offer-data" {...stepMotion}>
      <header className="sr-is-config-step__header">
        <h2 className="sr-is-config-step__title">
          {t('student.internshipOffers.interviewSim.config.offerData.title')}
        </h2>
        <p className="sr-is-config-step__subtitle">
          {t('student.internshipOffers.interviewSim.config.offerData.subtitle')}
        </p>
      </header>

      <div className="sr-is-config-offer-mode">
        {OFFER_MODE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={['sr-is-config-offer-mode__btn', selected && 'sr-is-config-offer-mode__btn--active']
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleModeChange(opt.id)}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{t(opt.titleKey)}</span>
            </button>
          );
        })}
      </div>

      {mode === 'url' ? (
        <div className="sr-is-config-offer-panel">
          <label className="sr-is-config-field" htmlFor="offer-url">
            <span className="sr-is-config-field__label">
              {t('student.internshipOffers.interviewSim.config.offerData.url.label')}
            </span>
            <div className="sr-is-config-field__control">
              <Link2 className="sr-is-config-field__icon" aria-hidden />
              <input
                id="offer-url"
                type="url"
                className="sr-is-config-field__input"
                placeholder={t('student.internshipOffers.interviewSim.config.offerData.url.placeholder')}
                value={config.offerUrl ?? ''}
                onChange={(e) => {
                  setExtracted(false);
                  onConfigChange({
                    offerUrl: e.target.value,
                    extractedOfferPreview: undefined,
                    customJobTitle: undefined,
                    customCompany: undefined,
                    customDescription: undefined,
                    offerImportJobUuid: undefined,
                  });
                }}
              />
            </div>
          </label>
          <div className="sr-is-config-offer-panel__actions">
            <button
              type="button"
              className="sr-is-btn sr-is-btn--primary"
              disabled={!config.offerUrl?.trim() || loading}
              onClick={() => void handleExtract()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t('student.internshipOffers.interviewSim.config.offerData.extracting')}
                </>
              ) : (
                t('student.internshipOffers.interviewSim.config.offerData.extract')
              )}
            </button>
          </div>
          <p className="sr-is-config-offer-panel__hint">
            {t('student.internshipOffers.interviewSim.config.offerData.url.hint')}
          </p>
          {error ? <p className="sr-is-config-offer-panel__error">{error}</p> : null}
        </div>
      ) : (
        <div className="sr-is-config-offer-panel sr-is-config-offer-fields">
          <label className="sr-is-config-field" htmlFor="offer-job-title">
            <span className="sr-is-config-field__label">
              {t('student.internshipOffers.interviewSim.config.jobTitle')}
            </span>
            <div className="sr-is-config-field__control">
              <Briefcase className="sr-is-config-field__icon" aria-hidden />
              <input
                id="offer-job-title"
                className="sr-is-config-field__input"
                placeholder={t('student.internshipOffers.interviewSim.config.offerData.placeholders.jobTitle')}
                value={config.customJobTitle ?? ''}
                onChange={(e) => onConfigChange({ customJobTitle: e.target.value })}
              />
            </div>
          </label>

          <label className="sr-is-config-field" htmlFor="offer-company">
            <span className="sr-is-config-field__label">
              {t('student.internshipOffers.interviewSim.config.company')}
            </span>
            <div className="sr-is-config-field__control">
              <Building2 className="sr-is-config-field__icon" aria-hidden />
              <input
                id="offer-company"
                className="sr-is-config-field__input"
                placeholder={t('student.internshipOffers.interviewSim.config.offerData.placeholders.company')}
                value={config.customCompany ?? ''}
                onChange={(e) => onConfigChange({ customCompany: e.target.value })}
              />
            </div>
          </label>

          <label className="sr-is-config-field" htmlFor="offer-description">
            <span className="sr-is-config-field__label">
              {t('student.internshipOffers.interviewSim.config.description')}
            </span>
            <div className="sr-is-config-field__control sr-is-config-field__control--textarea">
              <FileText className="sr-is-config-field__icon sr-is-config-field__icon--textarea" aria-hidden />
              <textarea
                id="offer-description"
                className="sr-is-config-field__textarea"
                placeholder={t('student.internshipOffers.interviewSim.config.offerData.placeholders.description')}
                value={config.customDescription ?? ''}
                onChange={(e) => onConfigChange({ customDescription: e.target.value })}
                rows={6}
              />
            </div>
          </label>
        </div>
      )}

      {extracted && config.extractedOfferPreview ? (
        <SimulatorOfferExtractedPreview preview={config.extractedOfferPreview} />
      ) : null}
    </motion.div>
  );
};

export const StepInterviewSettings: FunctionComponent<StepProps> = ({ config, onConfigChange }) => {
  const { t } = useTranslation();
  const genders: InterviewerGender[] = ['female', 'male'];

  return (
    <motion.div className="sr-is-config-step sr-is-config-step--settings" {...stepMotion}>
      <header className="sr-is-config-step__header">
        <h2 className="sr-is-config-step__title">
          {t('student.internshipOffers.interviewSim.config.settings.title')}
        </h2>
        <p className="sr-is-config-step__subtitle">
          {t('student.internshipOffers.interviewSim.config.settings.subtitle')}
        </p>
      </header>

      <div className="sr-is-config-settings">
        <section className="sr-is-config-settings__section">
          <h3 className="sr-is-config-settings__label">
            {t('student.internshipOffers.interviewSim.config.settings.interviewer')}
          </h3>
          <div className="sr-is-config-settings__gender">
            {genders.map((gender) => {
              const selected = config.interviewerGender === gender;
              return (
                <button
                  key={gender}
                  type="button"
                  className={['sr-is-config-settings__gender-btn', selected && 'sr-is-config-settings__gender-btn--active']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onConfigChange({ interviewerGender: gender })}
                >
                  <UserRound className="h-5 w-5" aria-hidden />
                  {t(`student.internshipOffers.interviewSim.config.settings.gender.${gender}`)}
                </button>
              );
            })}
          </div>
        </section>

        <section className="sr-is-config-settings__section">
          <h3 className="sr-is-config-settings__label">
            {t('student.internshipOffers.interviewSim.config.settings.experience')}
          </h3>
          <div className="sr-is-config-settings__chips">
            {EXPERIENCE_LEVELS.map((level) => {
              const selected = config.experienceLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  className={['sr-is-config-settings__chip', selected && 'sr-is-config-settings__chip--active']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onConfigChange({ experienceLevel: level })}
                >
                  {t(`student.internshipOffers.interviewSim.config.settings.experienceLevels.${level}`)}
                </button>
              );
            })}
          </div>
        </section>

        <section className="sr-is-config-settings__section">
          <h3 className="sr-is-config-settings__label">
            {t('student.internshipOffers.interviewSim.config.language.title')}
          </h3>
          <div className="sr-is-config-language-grid sr-is-config-language-grid--compact">
            {LANGUAGES.map((lang) => {
              const selected = config.language === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  className={['sr-is-config-language-card', selected && 'sr-is-config-language-card--active']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onConfigChange({ language: lang })}
                >
                  <span className="sr-is-config-language-card__flag" aria-hidden>
                    {LANGUAGE_FLAG[lang]}
                  </span>
                  <h4 className="sr-is-config-language-card__title">
                    {t(`student.internshipOffers.interviewSim.config.language.${lang}`)}
                  </h4>
                  <p className="sr-is-config-language-card__fluency">
                    {t(LANGUAGE_FLUENCY_KEYS[lang])}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="sr-is-config-settings__section">
          <h3 className="sr-is-config-settings__label">
            {t('student.internshipOffers.interviewSim.config.duration.title')}
          </h3>
          <div className="sr-is-config-duration-grid sr-is-config-duration-grid--compact">
            {LENGTHS.map((len) => {
              const selected = config.length === len;
              return (
                <button
                  key={len}
                  type="button"
                  className={['sr-is-config-duration-card', selected && 'sr-is-config-duration-card--active']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onConfigChange({ length: len })}
                >
                  <span className="sr-is-config-duration-card__time">{len}</span>
                  <span className="sr-is-config-duration-card__unit">min</span>
                  <p className="sr-is-config-duration-card__questions">
                    {t('student.internshipOffers.interviewSim.config.duration.questions', {
                      count: QUESTIONS_BY_LENGTH[len],
                    })}
                  </p>
                  <p className="sr-is-config-duration-card__intensity">{t(DURATION_INTENSITY_KEYS[len])}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="sr-is-config-settings__section">
          <h3 className="sr-is-config-settings__label">
            {t('student.internshipOffers.interviewSim.config.difficultyMeta.title')}
          </h3>
          <div className="sr-is-config-difficulty-grid">
            {DIFFICULTIES.map((d) => {
              const meta = DIFFICULTY_META[d];
              const selected = config.difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  className={['sr-is-config-difficulty-card', selected && 'sr-is-config-difficulty-card--active']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onConfigChange({ difficulty: d })}
                >
                  <span className="sr-is-config-difficulty-card__label">
                    {t(`student.internshipOffers.interviewSim.config.difficulty.${d}`)}
                  </span>
                  <ul className="sr-is-config-difficulty-card__meta">
                    <li>{t(meta.levelKey)}</li>
                    <li>{t(meta.complexityKey)}</li>
                  </ul>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </motion.div>
  );
};
