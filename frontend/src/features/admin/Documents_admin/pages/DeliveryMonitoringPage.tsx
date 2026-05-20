import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import DocumentsSubPageLayout from '../components/DocumentsSubPageLayout';
import DocumentsRequestsModernTable from '../components/DocumentsRequestsModernTable';
import { MOCK_REQUESTS } from '../data/documentsMockData';

const DeliveryMonitoringPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const deliveryRows = MOCK_REQUESTS.filter((r) =>
    ['ready', 'delivered', 'reserved'].includes(r.status),
  );

  return (
    <DocumentsSubPageLayout
      title={t('admin.documentsModule.deliveryPage.title')}
      subtitle={t('admin.documentsModule.deliveryPage.subtitle')}
    >
      <DocumentsRequestsModernTable rows={deliveryRows} />
    </DocumentsSubPageLayout>
  );
};

export default DeliveryMonitoringPage;
