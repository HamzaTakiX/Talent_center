import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import SRFSummaryStatCard from './SRFSummaryStatCard';
import { useSrfKpiCards } from '../hooks/useSrfFinancial';
import { SRF_KPI_ICON_MAP } from '../utils/srfKpiIcons';
import AdminKpiGrid from '../../ui/AdminKpiGrid';
import { SrfErrorState, SrfKpiLoading } from './SrfModuleStates';

/** Fallback when API returns no cards — show 0 instead of empty state. */
const SRF_KPI_ZERO_CARDS: { key: string; label_key: string; value: number }[] = [
  { key: 'paid', label_key: 'admin.kpi.srf.paidStudents', value: 0 },
  { key: 'unpaid', label_key: 'admin.kpi.srf.unpaidStudents', value: 0 },
  { key: 'partial', label_key: 'admin.kpi.srf.partiallyPaid', value: 0 },
  { key: 'pending_validation', label_key: 'admin.kpi.srf.pendingValidation', value: 0 },
  { key: 'late', label_key: 'admin.kpi.srf.latePayments', value: 0 },
  { key: 'blocked', label_key: 'admin.kpi.srf.blockedStudents', value: 0 },
  { key: 'exempted', label_key: 'admin.kpi.srf.exemptedStudents', value: 0 },
];

const routeByLabelKey: Record<string, string> = {
  'admin.kpi.srf.paidStudents': '/admin/srf/paid-students',
  'admin.kpi.srf.unpaidStudents': '/admin/srf/unpaid-students',
  'admin.kpi.srf.partiallyPaid': '/admin/srf/partially-paid',
  'admin.kpi.srf.pendingValidation': '/admin/srf/pending-validation',
  'admin.kpi.srf.latePayments': '/admin/srf/late-payments',
  'admin.kpi.srf.blockedStudents': '/admin/srf/blocked-students',
  'admin.kpi.srf.exemptedStudents': '/admin/srf/exempted-students',
};

const StudentFinancialSummaryGrid: FunctionComponent = () => {
  const navigate = useNavigate();
  const { cards, loading, error, reload } = useSrfKpiCards();

  if (error) {
    return <SrfErrorState onRetry={reload} />;
  }

  if (loading) {
    return <SrfKpiLoading count={7} />;
  }

  const displayCards = cards.length > 0 ? cards : SRF_KPI_ZERO_CARDS;

  return (
    <AdminKpiGrid columns={4}>
      {displayCards.map((card, index) => {
        const icons = SRF_KPI_ICON_MAP[card.key] ?? SRF_KPI_ICON_MAP.paid;
        const route = routeByLabelKey[card.label_key];
        return (
          <SRFSummaryStatCard
            key={card.label_key}
            label=""
            labelKey={card.label_key}
            value={card.value}
            IconComponent={icons.Icon}
            iconBgClass={icons.iconBgClass}
            index={index}
            onClick={route ? () => navigate(route) : undefined}
          />
        );
      })}
    </AdminKpiGrid>
  );
};

export default StudentFinancialSummaryGrid;
