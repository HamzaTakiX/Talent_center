import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import PendingValidationKpiCards from '../components/PendingValidationKpiCards';
import PendingValidationDetailTable from '../components/PendingValidationDetailTable';
import { AdminStatChartSection } from '../../../../ui';

const PendingValidationDetailPage: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <PendingValidationKpiCards />
      <AdminStatChartSection chartId="srf-pending-queue" />
      <PendingValidationDetailTable />
    </AdminListPageShell>
  );
};

export default PendingValidationDetailPage;
