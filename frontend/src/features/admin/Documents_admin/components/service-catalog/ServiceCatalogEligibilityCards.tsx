import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Check } from 'lucide-react';

interface EligibilityRule {
  id: string;
  icon: typeof Briefcase;
  labelKey: string;
  descriptionKey: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface Props {
  internshipOnly: boolean;
  finalYearOnly: boolean;
  onInternshipChange: (checked: boolean) => void;
  onFinalYearChange: (checked: boolean) => void;
}

const ServiceCatalogEligibilityCards: FunctionComponent<Props> = ({
  internshipOnly,
  finalYearOnly,
  onInternshipChange,
  onFinalYearChange,
}) => {
  const { t } = useTranslation();
  const P = 'admin.documentsModule.catalog.form.studio.eligibility';

  const rules: EligibilityRule[] = [
    {
      id: 'internship',
      icon: Briefcase,
      labelKey: `${P}.internshipOnly`,
      descriptionKey: `${P}.internshipOnlyDesc`,
      checked: internshipOnly,
      onChange: onInternshipChange,
    },
    {
      id: 'finalYear',
      icon: GraduationCap,
      labelKey: `${P}.finalYearOnly`,
      descriptionKey: `${P}.finalYearOnlyDesc`,
      checked: finalYearOnly,
      onChange: onFinalYearChange,
    },
  ];

  return (
    <div className="admin-doc-studio-eligibility-cards">
      <p className="admin-doc-studio-eligibility-cards__label">{t(`${P}.title`)}</p>
      <div className="admin-doc-studio-eligibility-cards__grid">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <button
              key={rule.id}
              type="button"
              className={`admin-doc-studio-eligibility-card ${rule.checked ? 'is-selected' : ''}`}
              onClick={() => rule.onChange(!rule.checked)}
              aria-pressed={rule.checked}
            >
              <span className="admin-doc-studio-eligibility-card__icon" aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <span className="admin-doc-studio-eligibility-card__content">
                <span className="admin-doc-studio-eligibility-card__title">{t(rule.labelKey)}</span>
                <span className="admin-doc-studio-eligibility-card__desc">{t(rule.descriptionKey)}</span>
              </span>
              {rule.checked && (
                <span className="admin-doc-studio-eligibility-card__check" aria-hidden>
                  <Check className="h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCatalogEligibilityCards;
