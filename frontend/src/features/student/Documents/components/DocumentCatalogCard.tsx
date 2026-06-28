import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import ServiceCatalogCard from '../../../admin/Documents_admin/components/service-catalog/ServiceCatalogCard';
import type { DocumentServiceCatalogItem } from '../../../admin/Documents_admin/types/documentServiceCatalog';

interface DocumentCatalogCardProps {
  item: DocumentServiceCatalogItem;
  onView?: (id: string) => void;
}

const DocumentCatalogCard: FunctionComponent<DocumentCatalogCardProps> = ({ item, onView }) => {
  const { t } = useTranslation();

  return (
    <ServiceCatalogCard
      service={item}
      onView={onView}
      viewAriaLabel={t('student.documents.viewAria')}
    />
  );
};

export default DocumentCatalogCard;
