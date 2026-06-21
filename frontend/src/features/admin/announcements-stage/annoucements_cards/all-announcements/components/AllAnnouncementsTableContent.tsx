import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCrudRoutes } from '../../../../shared/navigation/adminCrudRoutes';
import { Calendar, Eye, Pencil, Trash2, User } from 'lucide-react';
import type { AnnouncementRow } from '../../../types';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminSearchEmptyState, AdminTableEmptyState, AdminTableScroll } from '../../../../ui';
import { AnnouncementTypeLabel } from '../../../../ui/adminTableLabels';
import { announcementTypeTableBadge } from '../../../../ui/adminStatusBadges';
import {
  adminTableBtn,
  adminTableBtnDelete,
  adminTableBtnMobile,
  adminTableBtnMobileDanger,
} from '../../../../ui/adminTableButtons';
import { SafeTitleCell, SafeText, ADMIN_TABLE_COL } from '../../../../../../design-system/safeContent';

interface AllAnnouncementsTableContentProps {
  rows: AnnouncementRow[];
}

const AllAnnouncementsTableContent: FunctionComponent<AllAnnouncementsTableContentProps> = ({ rows }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {rows.length === 0 ? (
          <AdminSearchEmptyState title="No announcements match your filters." />
        ) : (
          rows.map((row) => (
            <AdminMobileRowCard
              key={row.id}
              title={<SafeText as="span">{row.title}</SafeText>}
              badges={<span className={announcementTypeTableBadge(row.type)}>{<AnnouncementTypeLabel type={row.type} />}</span>}
              fields={[
                {
                  label: 'Audience',
                  value: (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      {row.targetAudience}
                    </span>
                  ),
                },
                {
                  label: 'Date',
                  value: (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      {row.date}
                    </span>
                  ),
                },
              ]}
              actions={
                <>
                  <button type="button" className={adminTableBtnMobile} onClick={() => navigate(`/admin/announcements/${row.id}`)}>
                    <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    View
                  </button>
                  <button type="button" className={adminTableBtnMobile} onClick={() => navigate(adminCrudRoutes.announcementEdit(row.id))}>
                    <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    Edit
                  </button>
                  <button type="button" className={adminTableBtnMobileDanger} onClick={() => console.log('Delete', row.id)}>
                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    Delete
                  </button>
                </>
              }
            />
          ))
        )}
      </div>

      <div className="admin-module-table-wrap hidden lg:block">
        <AdminTableScroll minWidth="880px" className="admin-table-scroll--panel">
          <thead>
            <tr className="border-b border-[var(--admin-border)]">
              <th className={`py-2.5 pl-2 pr-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.title}`}>Title</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.status}`}>Type</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.text}`}>Target Audience</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.deadline}`}>Date</th>
              <th className={`py-2.5 px-4 text-right text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.actions}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <AdminTableEmptyState colSpan={5} title="No announcements match your filters." />
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--admin-border)] last:border-b-0">
                  <td className="max-w-0 py-3 pl-2 pr-4 align-middle font-medium">
                    <SafeTitleCell>{row.title}</SafeTitleCell>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle">
                    <span className={announcementTypeTableBadge(row.type)}>{<AnnouncementTypeLabel type={row.type} />}</span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      <SafeText>{row.targetAudience}</SafeText>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      {row.date}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button type="button" className={adminTableBtn} onClick={() => navigate(`/admin/announcements/${row.id}`)}>
                        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        View
                      </button>
                      <button type="button" className={adminTableBtn} onClick={() => navigate(adminCrudRoutes.announcementEdit(row.id))}>
                        <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        Edit
                      </button>
                      <button type="button" className={adminTableBtnDelete} onClick={() => console.log('Delete', row.id)}>
                        <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableScroll>
      </div>
    </>
  );
};

export default AllAnnouncementsTableContent;
