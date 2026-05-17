import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import LatePaymentsKpiCards from '../components/LatePaymentsKpiCards';
import LatePaymentsDetailTable from '../components/LatePaymentsDetailTable';
import { AdminStatChartSection } from '../../../../ui';

const LatePaymentsDetailPage: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <LatePaymentsKpiCards />
      <AdminStatChartSection chartId="srf-late-timeline" />
      <LatePaymentsDetailTable />
    </AdminListPageShell>
  );
};

export default LatePaymentsDetailPage;
