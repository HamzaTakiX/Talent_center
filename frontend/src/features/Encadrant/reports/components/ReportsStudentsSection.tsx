import { ChangeEvent, FunctionComponent, useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../admin/ui';
import {
  REPORTS_FILTER_BTN,
  REPORTS_SECTION_CARD,
  REPORTS_STUDENT_GRID,
  REPORTS_TOOLBAR_ROW,
} from '../constants/reportsLayout';
import { reportStudentsMock } from '../data/reportsMock';
import ReportsStudentCard from './ReportsStudentCard';

const ReportsStudentsSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reportStudentsMock;
    return reportStudentsMock.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.lastReportTitle.toLowerCase().includes(q) ||
        s.nextReportTitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className={REPORTS_SECTION_CARD} aria-label={t('encadrant.reports.overviewTitle')}>
      <header className="flex min-w-0 flex-col gap-1">
        <h2 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
          Student Reports Overview
        </h2>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
          {t('encadrant.reports.description')}
        </p>
      </header>

      <div className={REPORTS_TOOLBAR_ROW}>
        <AdminSearchInput
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder={t('encadrant.common.searchStudent')}
          aria-label={t('encadrant.common.searchStudent')}
          containerClassName="min-w-0 flex-1"
        />
        <button type="button" className={REPORTS_FILTER_BTN} aria-label={t('encadrant.common.filter')}>
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className={REPORTS_STUDENT_GRID}>
        {filteredStudents.map((student) => (
          <ReportsStudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
};

export default ReportsStudentsSection;
