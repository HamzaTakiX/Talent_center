import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../../../ui';
import PartiallyPaidKpiCards from '../components/PartiallyPaidKpiCards';
import PartiallyPaidDetailTable from '../components/PartiallyPaidDetailTable';
import { AdminStatChartSection } from '../../../../ui';

const PartiallyPaidDetailPage: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <PartiallyPaidKpiCards />
      <AdminStatChartSection chartId="srf-partially-paid" />
      <PartiallyPaidDetailTable />
    </AdminListPageShell>
  );
};

export default PartiallyPaidDetailPage;
