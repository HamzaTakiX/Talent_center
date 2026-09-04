import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../dashboard/ui/animations';

const FORM_PREFIX = 'admin.forms.createStudent';

interface StudentFormPageHeroProps {
  mode: 'create' | 'edit';
  displayName?: string;
}

const StudentFormPageHero: FunctionComponent<StudentFormPageHeroProps> = ({
  mode,
  displayName,
}) => {
  const { t } = useTranslation();
  const isEdit = mode === 'edit';
  const Icon = isEdit ? GraduationCap : UserPlus;
  const title = isEdit
    ? displayName?.trim() || t(`${FORM_PREFIX}.editTitle`)
    : t(`${FORM_PREFIX}.title`);
  const subtitle = isEdit
    ? t(`${FORM_PREFIX}.editSubtitle`)
    : t(`${FORM_PREFIX}.subtitle`);
  const badgeLabel = isEdit
    ? t(`${FORM_PREFIX}.editTitle`)
    : t(`${FORM_PREFIX}.heroBadge`);

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easePremium }}
      className="admin-encadrant-form-hero"
    >
      <div className="admin-encadrant-form-hero__glow" aria-hidden />

      <div className="admin-encadrant-form-hero__row">
        <span className="admin-encadrant-form-hero__icon" aria-hidden>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>

        <div className="admin-encadrant-form-hero__copy">
          <div className="admin-encadrant-form-hero__title-row">
            <h1 className="admin-encadrant-form-hero__title">{title}</h1>
            <span className="admin-encadrant-form-hero__badge">{badgeLabel}</span>
          </div>
          <p className="admin-encadrant-form-hero__subtitle">{subtitle}</p>
        </div>
      </div>
    </motion.header>
  );
};

export default StudentFormPageHero;
