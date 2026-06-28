import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Check, ClipboardCheck, CreditCard, UserCheck } from 'lucide-react';
import type { DocumentServiceConfig } from '../../types/documentServiceCatalog';

interface Props {
  validation: DocumentServiceConfig['validation'];
  onChange: (partial: Partial<DocumentServiceConfig['validation']>) => void;
}

const ServiceCatalogValidationCards: FunctionComponent<Props> = ({ validation, onChange }) => {
  const { t } = useTranslation();
  const P = 'admin.documentsModule.catalog.form.studio.validationRules';

  const rules = [
    {
      id: 'internshipRequired',
      icon: Briefcase,
      labelKey: `${P}.internship`,
      descKey: `${P}.internshipDesc`,
      checked: validation.internshipRequired,
      onChange: (v: boolean) => onChange({ internshipRequired: v }),
    },
    {
      id: 'activeStudentRequired',
      icon: UserCheck,
      labelKey: `${P}.activeStudent`,
      descKey: `${P}.activeStudentDesc`,
      checked: validation.activeStudentRequired,
      onChange: (v: boolean) => onChange({ activeStudentRequired: v }),
    },
    {
      id: 'registrationCompleteRequired',
      icon: ClipboardCheck,
      labelKey: `${P}.registration`,
      descKey: `${P}.registrationDesc`,
      checked: validation.registrationCompleteRequired,
      onChange: (v: boolean) => onChange({ registrationCompleteRequired: v }),
    },
    {
      id: 'srfClearanceRequired',
      icon: CreditCard,
      labelKey: `${P}.srf`,
      descKey: `${P}.srfDesc`,
      checked: validation.srfClearanceRequired,
      onChange: (v: boolean) => onChange({ srfClearanceRequired: v }),
    },
  ];

  return (
    <div className="admin-doc-studio-validation-cards">
      {rules.map((rule) => {
        const Icon = rule.icon;
        return (
          <button
            key={rule.id}
            type="button"
            className={`admin-doc-studio-validation-card ${rule.checked ? 'is-selected' : ''}`}
            onClick={() => rule.onChange(!rule.checked)}
            aria-pressed={rule.checked}
          >
            <span className="admin-doc-studio-validation-card__icon" aria-hidden>
              <Icon className="h-5 w-5" />
            </span>
            <span className="admin-doc-studio-validation-card__content">
              <span className="admin-doc-studio-validation-card__title">{t(rule.labelKey)}</span>
              <span className="admin-doc-studio-validation-card__desc">{t(rule.descKey)}</span>
            </span>
            {rule.checked && (
              <span className="admin-doc-studio-validation-card__check" aria-hidden>
                <Check className="h-4 w-4" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ServiceCatalogValidationCards;
