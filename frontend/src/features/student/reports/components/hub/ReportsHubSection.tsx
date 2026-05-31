import { FunctionComponent } from 'react';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ReportHubCard from './ReportHubCard';
import type { ReportHubCategory, StudentReportSummary } from '../../types';

interface ReportsHubSectionProps {
  category: ReportHubCategory;
  reports: StudentReportSummary[];
}

const categoryIconMap: Record<ReportHubCategory, typeof BookOpen> = {
  my: BookOpen,
  drafts: BookOpen,
  submitted: BookOpen,
  templates: BookOpen,
  archived: BookOpen,
};

const ReportsHubSection: FunctionComponent<ReportsHubSectionProps> = ({ category, reports }) => {
  const { t } = useTranslation();
  const Icon = categoryIconMap[category];

  if (reports.length === 0) return null;

  return (
    <section className="student-reports-section" aria-label={t(`student.reports.hub.sections.${category}`)}>
      <h2 className="student-reports-section__title">
        <Icon className="h-5 w-5 text-[var(--admin-brand)]" aria-hidden />
        {t(`student.reports.hub.sections.${category}`)}
        <span className="ml-1 text-sm font-normal text-[var(--admin-text-muted)]">({reports.length})</span>
      </h2>
      <div className="student-reports-grid">
        {reports.map((report, i) => (
          <ReportHubCard key={report.id} report={report} index={i} />
        ))}
      </div>
    </section>
  );
};

export default ReportsHubSection;
