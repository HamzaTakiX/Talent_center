import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import type { DocumentServiceWritePayload, ServiceCatalogFormTab } from '../../types/documentServiceCatalog';
import { isStudioStepComplete } from './serviceCatalogStudioSteps';
import { getVisibleSteps } from './serviceCatalogStepVisibility';

interface Props {
  active: ServiceCatalogFormTab;
  value: DocumentServiceWritePayload;
  onSelect: (tab: ServiceCatalogFormTab) => void;
}

const ServiceCatalogStudioStepsNav: FunctionComponent<Props> = ({ active, value, onSelect }) => {
  const { t } = useTranslation();

  return (
    <nav className="admin-doc-studio-steps" aria-label={t('admin.documentsModule.catalog.form.tabsLabel')}>
      <p className="admin-doc-studio-steps__label">
        {t('admin.documentsModule.catalog.form.studio.navigation')}
      </p>
      <ul className="admin-doc-studio-steps__list">
        {getVisibleSteps(value).map((step, index) => {
          const done = isStudioStepComplete(step.key, value);
          const isActive = active === step.key;
          const Icon = step.icon;
          return (
            <li key={step.key}>
              <button
                type="button"
                className={`admin-doc-studio-step ${isActive ? 'admin-doc-studio-step--active' : ''} ${done ? 'admin-doc-studio-step--done' : ''}`}
                onClick={() => onSelect(step.key)}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="admin-doc-studio-step__index" aria-hidden>
                  {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <Icon className="admin-doc-studio-step__icon h-4 w-4" aria-hidden />
                <span className="admin-doc-studio-step__text">
                  {t(`admin.documentsModule.catalog.form.tabs.${step.key}`)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default ServiceCatalogStudioStepsNav;
