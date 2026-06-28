import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Briefcase,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Shield,
  Stamp,
} from 'lucide-react';
import type { DocumentServiceCategory } from '../../types/documentServiceCatalog';

interface Props {
  value: DocumentServiceCategory;
  onChange: (category: DocumentServiceCategory) => void;
}

const CATEGORIES: {
  value: DocumentServiceCategory;
  icon: typeof FileText;
  color: string;
}[] = [
  { value: 'ATTESTATION', icon: GraduationCap, color: 'blue' },
  { value: 'CONVENTION', icon: Briefcase, color: 'violet' },
  { value: 'CERTIFICATE', icon: Award, color: 'amber' },
  { value: 'AUTHORIZATION', icon: Shield, color: 'navy' },
  { value: 'REPORT', icon: FileSpreadsheet, color: 'cyan' },
  { value: 'OTHER', icon: Stamp, color: 'slate' },
];

const ServiceCatalogCategoryCards: FunctionComponent<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="admin-doc-studio-category-cards">
      <p className="admin-doc-studio-category-cards__label">
        {t('admin.documentsModule.catalog.form.category')}
      </p>
      <div className="admin-doc-studio-category-cards__grid">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const selected = value === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              className={`admin-doc-studio-category-card admin-doc-studio-category-card--${cat.color} ${selected ? 'is-selected' : ''}`}
              onClick={() => onChange(cat.value)}
              aria-pressed={selected}
            >
              <span className="admin-doc-studio-category-card__icon" aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <span className="admin-doc-studio-category-card__label">
                {t(`admin.documentsModule.catalog.categories.${cat.value}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCatalogCategoryCards;
