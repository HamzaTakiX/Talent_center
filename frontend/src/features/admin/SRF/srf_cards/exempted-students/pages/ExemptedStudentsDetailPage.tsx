import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import ExemptedStudentsKpiCards from '../components/ExemptedStudentsKpiCards';
import ExemptedStudentsDetailTable from '../components/ExemptedStudentsDetailTable';
import { AdminStatChartSection } from '../../../../ui';

const ExemptedStudentsDetailPage: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <ExemptedStudentsKpiCards />
      <AdminStatChartSection chartId="srf-exempted-reasons" />
      <ExemptedStudentsDetailTable />
    </AdminListPageShell>
  );
};

export default ExemptedStudentsDetailPage;
