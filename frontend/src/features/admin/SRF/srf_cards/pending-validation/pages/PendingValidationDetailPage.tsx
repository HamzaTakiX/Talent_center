import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import AdminStatChartSection from '../../../../ui/charts/AdminStatChartSection';
import SrfSubpageKpiCards from '../../../components/SrfSubpageKpiCards';
import PendingValidationProofTable from '../../../components/PendingValidationProofTable';

const PendingValidationDetailPage: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <SrfSubpageKpiCards subpageId="pending-validation" />
      <AdminStatChartSection chartId="srf-pending-queue" />
      <PendingValidationProofTable />
    </AdminListPageShell>
  );
};

export default PendingValidationDetailPage;
