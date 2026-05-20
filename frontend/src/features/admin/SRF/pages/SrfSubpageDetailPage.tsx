import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../ui';
import AdminStatChartSection from '../../ui/charts/AdminStatChartSection';
import type { StatPageChartId } from '../../ui';
import type { SrfSubpageId } from '../constants';
import SrfSubpageKpiCards from '../components/SrfSubpageKpiCards';
import SrfSubpageSection from '../components/SrfSubpageSection';

interface SrfSubpageDetailPageProps {
  subpageId: SrfSubpageId;
  chartId: StatPageChartId;
  showRemaining?: boolean;
}

const SrfSubpageDetailPage: FunctionComponent<SrfSubpageDetailPageProps> = ({
  subpageId,
  chartId,
  showRemaining = false,
}) => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <SrfSubpageKpiCards subpageId={subpageId} />
      <AdminStatChartSection chartId={chartId} />
      <SrfSubpageSection subpageId={subpageId} showRemaining={showRemaining} />
    </AdminListPageShell>
  );
};

export default SrfSubpageDetailPage;
