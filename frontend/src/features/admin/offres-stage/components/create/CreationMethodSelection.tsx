import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, BriefcaseBusiness, Check, Sparkles } from 'lucide-react';
import BackButtonRow from '../../../../../shared/navigation/BackButtonRow';
import { useBackNavigation } from '../../../../../shared/navigation/useBackNavigation';
import { CREATION_METHOD_CARDS } from '../../constants/createOfferWorkflow';
import type { CreationMethod } from '../../types/createOfferWorkflow';
import { OFFER_STUDIO_BTN_SECONDARY } from './offerStudioClasses';

const PREFIX = 'admin.forms.createOfferStudio.method';

/* ── Animated studio eyebrow badge ── */
const StudioBadge: FunctionComponent<{ label: string }> = ({ label }) => (
  <motion.div
    className="offer-studio-badge"
    initial={{ opacity: 0, scale: 0.88, y: -6 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    aria-hidden
  >
    {/* Orbital ring that spins around the bot icon */}
    <span className="offer-studio-badge__orbit" aria-hidden>
      <span className="offer-studio-badge__orbit-dot" />
    </span>

    {/* Bot icon with breathing pulse */}
    <span className="offer-studio-badge__bot" aria-hidden>
      <Bot className="offer-studio-badge__bot-icon" strokeWidth={1.6} />
    </span>

    {/* Separator dot */}
    <span className="offer-studio-badge__sep" aria-hidden />

    {/* Label */}
    <BriefcaseBusiness
      className="offer-studio-badge__offer-icon"
      strokeWidth={1.65}
      aria-hidden
    />
    <span className="offer-studio-badge__label">{label}</span>

    {/* Trailing sparkle */}
    <Sparkles className="offer-studio-badge__sparkle" strokeWidth={1.5} aria-hidden />
  </motion.div>
);

interface CreationMethodSelectionProps {
  selected: CreationMethod;
  onSelect: (method: Exclude<CreationMethod, null>) => void;
  onBack: () => void;
}
const CreationMethodSelection: FunctionComponent<CreationMethodSelectionProps> = ({
  selected,
  onSelect,
  onBack,
}) => {
  const { t } = useTranslation();
  const { BackIcon, controlClassName } = useBackNavigation();

  return (
    <section className="offer-method-select" aria-labelledby="offer-method-select-title">
      <BackButtonRow className="offer-method-select__toolbar">
        <button
          type="button"
          onClick={onBack}
          className={`${OFFER_STUDIO_BTN_SECONDARY} ${controlClassName} offer-method-select__back h-9 w-fit`}
        >
          <BackIcon className="h-4 w-4" aria-hidden />
          {t('admin.back.offers')}
        </button>
      </BackButtonRow>

      <div className="offer-method-select__hero">
        <StudioBadge label={t(`${PREFIX}.eyebrow`)} />
        <h1 id="offer-method-select-title" className="offer-method-select__title">
          {t(`${PREFIX}.stepTitle`)}
        </h1>
        <p className="offer-method-select__subtitle">{t(`${PREFIX}.stepDesc`)}</p>
      </div>

      <div className="offer-method-select__grid">
        {CREATION_METHOD_CARDS.map((card, index) => {
          const Icon = card.icon;
          const isSelected = selected === card.key;
          const benefits = t(`${PREFIX}.${card.benefitsKey}`, { returnObjects: true }) as string[];

          return (
            <motion.button
              key={card.key}
              type="button"
              className={`offer-method-card offer-method-card--modern offer-method-card--${card.key} ${isSelected ? 'offer-method-card--selected' : ''}`}
              onClick={() => onSelect(card.key)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.995 }}
            >
              <span className="offer-method-card__badge">{t(`${PREFIX}.${card.badgeKey}`)}</span>

              <div className="offer-method-card__header">
                <span className="offer-method-card__icon">
                  <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="offer-method-card__headings">
                  <h2 className="offer-method-card__title">{t(`${PREFIX}.${card.titleKey}`)}</h2>
                  <p className="offer-method-card__desc">{t(`${PREFIX}.${card.descKey}`)}</p>
                </div>
              </div>

              <p className="offer-method-card__long-desc">{t(`${PREFIX}.${card.longDescKey}`)}</p>

              <ul className="offer-method-card__benefits offer-method-card__benefits--checks">
                {Array.isArray(benefits) &&
                  benefits.map((benefit) => (
                    <li key={benefit}>
                      <Check className="offer-method-card__check" aria-hidden />
                      <span>{benefit}</span>
                    </li>
                  ))}
              </ul>

              <div className="offer-method-card__footer">
                <span className="offer-method-card__best-for">{t(`${PREFIX}.${card.bestForKey}`)}</span>
                <span className="offer-method-card__cta">
                  {t(`${PREFIX}.${card.ctaKey}`)}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default CreationMethodSelection;
