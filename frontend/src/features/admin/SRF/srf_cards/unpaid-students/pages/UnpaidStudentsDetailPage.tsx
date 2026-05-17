import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import UnpaidStudentsKpiCards from '../components/UnpaidStudentsKpiCards';
import UnpaidStudentsDetailTable from '../components/UnpaidStudentsDetailTable';
import { AdminStatChartSection } from '../../../../ui';

const UnpaidStudentsDetailPage: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <UnpaidStudentsKpiCards />
      <AdminStatChartSection chartId="srf-unpaid-amounts" />
      <UnpaidStudentsDetailTable />
    </AdminListPageShell>
  );
};

export default UnpaidStudentsDetailPage;
