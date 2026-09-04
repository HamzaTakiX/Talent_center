import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Brain, Gauge, GraduationCap, Layers, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../dashboard/ui/animations';
import '../styles/admin-smart-assignment-hero.css';

const PREFIX = 'admin.smartAssignment';

const HERO_CHIPS = [
  { key: 'internship', icon: Layers },
  { key: 'program', icon: GraduationCap },
  { key: 'sector', icon: Sparkles },
  { key: 'workload', icon: Gauge },
] as const;

const SmartAssignmentPageHero: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easePremium }}
      className="sa-page-hero"
    >
      <div className="sa-page-hero__blob sa-page-hero__blob--primary" aria-hidden />
      <div className="sa-page-hero__blob sa-page-hero__blob--secondary" aria-hidden />
      <div className="sa-page-hero__blob sa-page-hero__blob--accent" aria-hidden />
      <div className="sa-page-hero__mesh" aria-hidden />

      <div className="sa-page-hero__content">
        <div className="sa-page-hero__main">
          <div className="sa-page-hero__icon-shell" aria-hidden>
            <span className="sa-page-hero__icon-ring" />
            <span className="sa-page-hero__icon">
              <Brain className="h-6 w-6" strokeWidth={1.75} />
            </span>
          </div>

          <div className="sa-page-hero__copy">
            <div className="sa-page-hero__title-row">
              <h1 className="sa-page-hero__title">{t(`${PREFIX}.title`)}</h1>
              <span className="sa-page-hero__badge">{t(`${PREFIX}.heroBadge`)}</span>
            </div>
            <p className="sa-page-hero__subtitle">{t(`${PREFIX}.subtitle`)}</p>
          </div>
        </div>

        <ul className="sa-page-hero__chips" aria-label={t(`${PREFIX}.engineHint`)}>
          {HERO_CHIPS.map(({ key, icon: Icon }) => (
            <li key={key} className="sa-page-hero__chip">
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              <span>{t(`${PREFIX}.heroChips.${key}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.header>
  );
};

export default SmartAssignmentPageHero;
