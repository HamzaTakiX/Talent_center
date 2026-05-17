import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import PaidStudentsKpiCards from '../components/PaidStudentsKpiCards';
import PaidStudentsDetailTable from '../components/PaidStudentsDetailTable';
import { AdminStatChartSection } from '../../../../ui';

const PaidStudentsDetailPage: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <PaidStudentsKpiCards />
      <AdminStatChartSection chartId="srf-paid-overview" />
      <PaidStudentsDetailTable />
    </AdminListPageShell>
  );
};

export default PaidStudentsDetailPage;
