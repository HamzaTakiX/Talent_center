import { ChangeEvent, FunctionComponent, useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSearchInput } from '../../../../../admin/ui';
import {
  REPORTS_SUBMITTED_FILTER_BTN,
  REPORTS_SUBMITTED_SEARCH_ROW,
  REPORTS_SUBMITTED_SECTION_CARD,
  REPORTS_SUBMITTED_STUDENT_GRID,
} from '../constants/reportsSubmittedLayout';
import { reportsSubmittedStudentsMock } from '../data/reportsSubmittedMock';
import ReportsSubmittedStudentCard from './ReportsSubmittedStudentCard';

const ReportsSubmittedStudentsSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reportsSubmittedStudentsMock;
    return reportsSubmittedStudentsMock.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.lastReportTitle.toLowerCase().includes(q) ||
        s.nextReportTitle.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className={REPORTS_SUBMITTED_SECTION_CARD} aria-label={t('encadrant.header.titles.reportsSubmitted')}>
      <div className={REPORTS_SUBMITTED_SEARCH_ROW}>
        <AdminSearchInput
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder={t('encadrant.common.searchStudent')}
          aria-label={t('encadrant.common.searchStudent')}
          containerClassName="min-w-0 flex-1"
        />
        <button type="button" className={REPORTS_SUBMITTED_FILTER_BTN} aria-label={t('encadrant.common.filter')}>
          <Filter className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className={REPORTS_SUBMITTED_STUDENT_GRID}>
        {filteredStudents.map((student) => (
          <ReportsSubmittedStudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
};

export default ReportsSubmittedStudentsSection;
