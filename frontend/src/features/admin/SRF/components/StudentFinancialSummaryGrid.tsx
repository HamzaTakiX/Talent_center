import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import SRFSummaryStatCard from './SRFSummaryStatCard';
import { studentFinancialSummaryStats } from '../data/srfFinancialMock';
import AdminKpiGrid from '../../ui/AdminKpiGrid';

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

  return (
    <AdminKpiGrid columns={4}>
      {studentFinancialSummaryStats.map((stat, index) => {
        const labelKey = stat.labelKey;
        const route = labelKey ? routeByLabelKey[labelKey] : undefined;
        return (
          <SRFSummaryStatCard
            key={labelKey ?? stat.label}
            label={stat.label}
            labelKey={labelKey}
            value={stat.value}
            IconComponent={stat.Icon}
            iconBgClass={stat.iconBgClass}
            index={index}
            onClick={route ? () => navigate(route) : undefined}
          />
        );
      })}
    </AdminKpiGrid>
  );
};

export default StudentFinancialSummaryGrid;
