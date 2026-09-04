import { ChangeEvent, FunctionComponent, useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../../../admin/ui';
import {
  REPORTS_PENDING_FILTER_BTN,
  REPORTS_PENDING_SEARCH_ROW,
  REPORTS_PENDING_SECTION_CARD,
  REPORTS_PENDING_STUDENT_GRID,
} from '../constants/reportsPendingLayout';
import { reportsPendingStudentsMock } from '../data/reportsPendingMock';
import ReportsPendingStudentCard from './ReportsPendingStudentCard';

const ReportsPendingStudentsSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reportsPendingStudentsMock;
    return reportsPendingStudentsMock.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.lastReportTitle.toLowerCase().includes(q) ||
        s.nextReportTitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className={REPORTS_PENDING_SECTION_CARD} aria-label={t('encadrant.header.titles.reportsPendingList')}>
      <div className={REPORTS_PENDING_SEARCH_ROW}>
        <AdminSearchInput
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder={t('encadrant.common.searchStudent')}
          aria-label={t('encadrant.common.searchStudent')}
          containerClassName="min-w-0 flex-1"
        />
        <button type="button" className={REPORTS_PENDING_FILTER_BTN} aria-label={t('encadrant.common.filter')}>
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className={REPORTS_PENDING_STUDENT_GRID}>
        {filteredStudents.map((student) => (
          <ReportsPendingStudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
};

export default ReportsPendingStudentsSection;
