import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import BlockedStudentsKpiCards from '../components/BlockedStudentsKpiCards';
import BlockedStudentsDetailTable from '../components/BlockedStudentsDetailTable';
import { AdminStatChartSection } from '../../../../ui';

const BlockedStudentsDetailPage: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <BlockedStudentsKpiCards />
      <AdminStatChartSection chartId="srf-blocked-trend" />
      <BlockedStudentsDetailTable />
    </AdminListPageShell>
  );
};

export default BlockedStudentsDetailPage;
