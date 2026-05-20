import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardPanel from '../../../../admin/dashboard/ui/DashboardPanel';
import AdminSectionEmptyState from '../../../../admin/ui/AdminSectionEmptyState';
import { STUDENT_ANNOUNCEMENTS_PATH } from '../../../Annoucements/constants/routes';
import { studentAnnouncementRows } from '../../data/studentDashboardMock';
import type { StudentAnnouncementRow } from '../../data/studentDashboardMock';
import StudentSectionHeader from '../StudentSectionHeader';

const badgeClass: Record<StudentAnnouncementRow['badgeVariant'], string> = {
  interview:
    'border border-[color-mix(in_srgb,#7c3aed_30%,var(--admin-border))] bg-[color-mix(in_srgb,#7c3aed_12%,var(--admin-bg-elevated))] text-[#7c3aed]',
  pending:
    'border border-[color-mix(in_srgb,#d97706_30%,var(--admin-border))] bg-[color-mix(in_srgb,#d97706_12%,var(--admin-bg-elevated))] text-[#d97706]',
  info: 'border border-[var(--admin-border)] bg-[var(--admin-surface-inset)] text-[var(--admin-text-secondary)]',
};

const AnnouncementCard: FunctionComponent<{ row: StudentAnnouncementRow }> = ({ row }) => (
  <article className="student-offer-card">
    <div className="flex w-full min-w-0 items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-base font-semibold tracking-tight text-[var(--admin-text)]">{row.title}</h3>
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-[var(--admin-text-secondary)]">
          <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="truncate">{row.company}</span>
        </div>
      </div>
      <span
        className={`inline-flex h-[22px] shrink-0 items-center rounded-lg px-2 text-[11px] font-semibold ${badgeClass[row.badgeVariant]}`}
      >
        {row.badgeLabel}
      </span>
    </div>
    <p className="text-[13px] leading-snug text-[var(--admin-text-secondary)]">{row.snippet}</p>
  </article>
);

const StudentAnnouncementsCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DashboardPanel id="student-announcements" className="admin-section-panel w-full">
      <StudentSectionHeader
        icon={<Bell strokeWidth={1.75} aria-hidden />}
        title={t('student.dashboard.sections.announcements')}
        subtitle={t('student.dashboard.sections.announcementsSubtitle')}
        action={{ label: t('common.viewAll'), onClick: () => navigate(STUDENT_ANNOUNCEMENTS_PATH) }}
      />

      {studentAnnouncementRows.length === 0 ? (
        <div className="p-4 sm:p-5">
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="inbox"
            title={t('student.dashboard.empty.noAnnouncements')}
            description={t('student.dashboard.empty.noAnnouncementsDesc')}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4 pb-5 pt-1 sm:px-5 sm:pb-6">
          {studentAnnouncementRows.map((row) => (
            <AnnouncementCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </DashboardPanel>
  );
};

export default StudentAnnouncementsCard;
