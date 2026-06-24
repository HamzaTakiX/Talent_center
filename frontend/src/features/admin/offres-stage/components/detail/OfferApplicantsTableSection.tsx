import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DetailsSectionCard from '../../../../student/internship_offers/components/details/DetailsSectionCard';
import { DETAILS_SECTION_TITLE } from '../../../../student/internship_offers/constants/internshipOfferDetailsStyles';
import type { StageApplication } from '../../../../shared/types/stageTypes';
import AdminBadge, { type AdminBadgeVariant } from '../../../ui/AdminBadge';
import AdminPagination from '../../../ui/AdminPagination';
import AdminSearchInput from '../../../ui/AdminSearchInput';
import {
  AdminTableEmptyState,
  AdminTableScroll,
  AdminTableSkeletonRows,
} from '../../../ui';
import { useAdminPagination } from '../../../shared/hooks/useAdminPagination';
import { useAdminSearchPlaceholder } from '../../../i18n/useAdminCopy';
import InternshipStudentAvatar from '../../chat/components/InternshipStudentAvatar';
import type { OfferApplicationStatus } from '../../types';
import {
  filterOfferApplicantRows,
  mapStageApplicationToTableRow,
  type OfferApplicantStatusFilter,
} from '../../utils/filterOfferApplicants';
import { SafeText, ADMIN_TABLE_COL } from '../../../../../design-system/safeContent';
import '../../chat/styles/internship-support-inbox.css';
import '../../styles/offer-detail-page.css';

const PREFIX = 'admin.modules.offers.detailPage.applicantsTable';
const PAGE_SIZE = 10;

const STATUS_FILTERS: OfferApplicantStatusFilter[] = [
  'all',
  'Pending',
  'Interview',
  'Accepted',
  'Rejected',
];

const statusBadgeVariant: Record<OfferApplicationStatus, AdminBadgeVariant> = {
  Pending: 'info',
  Interview: 'warning',
  Accepted: 'success',
  Rejected: 'danger',
};

interface OfferApplicantsTableSectionProps {
  applications: StageApplication[];
  loading?: boolean;
}

const OfferApplicantsTableSection: FunctionComponent<OfferApplicantsTableSectionProps> = ({
  applications,
  loading = false,
}) => {
  const { t } = useTranslation();
  const searchPh = useAdminSearchPlaceholder('applications');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OfferApplicantStatusFilter>('all');

  const rows = useMemo(
    () => applications.map(mapStageApplicationToTableRow),
    [applications],
  );

  const filteredRows = useMemo(
    () => filterOfferApplicantRows(rows, { query, statusFilter }),
    [rows, query, statusFilter],
  );

  const {
    page,
    setPage,
    paginatedItems,
    totalItems,
    totalPages,
    pageSize,
    resetPage,
  } = useAdminPagination(filteredRows, PAGE_SIZE);

  useEffect(() => {
    resetPage();
  }, [query, statusFilter, resetPage]);

  const isEmpty = !loading && applications.length === 0;
  const isSearchEmpty = !loading && applications.length > 0 && filteredRows.length === 0;
  const showPagination = !loading && !isEmpty && !isSearchEmpty;

  const statusLabel = (status: OfferApplicationStatus) =>
    t(`${PREFIX}.status.${status}`, { defaultValue: status });

  return (
    <DetailsSectionCard
      id="offer-detail-applicants"
      className="scroll-mt-24 offer-applicants-table offer-applicants-table--page-bottom"
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className={`${DETAILS_SECTION_TITLE} m-0`}>
            {t(`${PREFIX}.title`, { count: applications.length })}
          </h2>
          <p className="m-0 mt-1 text-sm text-[var(--admin-text-secondary)]">
            {t(`${PREFIX}.subtitle`)}
          </p>
        </div>
      </div>

      <div className="offer-applicants-table__toolbar">
        <AdminSearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, 120))}
          placeholder={searchPh}
          aria-label={searchPh}
          containerClassName="offer-applicants-table__search"
        />
        <div
          className="offer-applicants-table__filters"
          role="group"
          aria-label={t(`${PREFIX}.filterAria`)}
        >
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`admin-filter-chip${statusFilter === filter ? ' admin-filter-chip--active' : ''}`}
              onClick={() => setStatusFilter(filter)}
              aria-pressed={statusFilter === filter}
            >
              {filter === 'all'
                ? t(`${PREFIX}.filters.all`)
                : statusLabel(filter)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-module-table-wrap admin-offers-table-wrap mt-3">
        <AdminTableScroll className="admin-table-scroll--offers">
          <table className="admin-table admin-table--safe w-full border-collapse">
            <thead>
              <tr>
                <th className={ADMIN_TABLE_COL.name}>{t(`${PREFIX}.columns.student`)}</th>
                <th className={ADMIN_TABLE_COL.text}>{t(`${PREFIX}.columns.class`)}</th>
                <th className={ADMIN_TABLE_COL.text}>{t(`${PREFIX}.columns.field`)}</th>
                <th className={ADMIN_TABLE_COL.text}>{t(`${PREFIX}.columns.match`)}</th>
                <th className={ADMIN_TABLE_COL.status}>{t(`${PREFIX}.columns.status`)}</th>
                <th className={ADMIN_TABLE_COL.text}>{t(`${PREFIX}.columns.appliedAt`)}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <AdminTableSkeletonRows colSpan={6} rows={5} />
              ) : isEmpty ? (
                <AdminTableEmptyState colSpan={6} title={t(`${PREFIX}.empty`)} />
              ) : isSearchEmpty ? (
                <AdminTableEmptyState colSpan={6} title={t(`${PREFIX}.searchEmpty`)} />
              ) : (
                paginatedItems.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="offer-applicants-table__student">
                        <InternshipStudentAvatar
                          url={row.avatarUrl}
                          name={row.studentName}
                          email={row.studentEmail}
                          size="list"
                        />
                        <div className="offer-applicants-table__student-meta min-w-0">
                          <span className="offer-applicants-table__student-name font-medium">
                            <SafeText>{row.studentName}</SafeText>
                          </span>
                          <span className="offer-applicants-table__student-email text-[var(--admin-text-muted)]">
                            <SafeText>{row.studentEmail}</SafeText>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <SafeText>{row.classLabel}</SafeText>
                    </td>
                    <td>
                      <SafeText>{row.field}</SafeText>
                    </td>
                    <td>
                      {row.matchScore != null ? (
                        <span className="font-medium tabular-nums">{row.matchScore}%</span>
                      ) : (
                        <span className="text-[var(--admin-text-muted)]">—</span>
                      )}
                    </td>
                    <td>
                      <AdminBadge variant={statusBadgeVariant[row.status]} className="rounded-full px-2.5 py-1">
                        {statusLabel(row.status)}
                      </AdminBadge>
                    </td>
                    <td>
                      <SafeText>{row.appliedAtLabel}</SafeText>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </AdminTableScroll>

        {showPagination ? (
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel={t('admin.pagination.students', { defaultValue: 'students' })}
          />
        ) : null}
      </div>
    </DetailsSectionCard>
  );
};

export default OfferApplicantsTableSection;
