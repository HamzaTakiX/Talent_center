import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User } from 'lucide-react';
import { AnnouncementRow } from '../types';
import AnnouncementsToolbar, { type AnnouncementTypeFilter } from './AnnouncementsToolbar';
import AdminEmptyState from '../../ui/AdminEmptyState';
import AdminTableEmptyState from '../../ui/AdminTableEmptyState';
import AdminMobileRowCard from '../../shared/AdminMobileRowCard';
import AdminModuleHeader from '../../ui/AdminModuleHeader';
import AdminModulePanel from '../../ui/AdminModulePanel';
import AdminRowActions from '../../ui/AdminRowActions';
import { AdminTableScroll } from '../../ui/AdminTable';
import { useAdminCopy } from '../../i18n/useAdminCopy';
import { announcementTypeTableBadge } from '../../ui/adminStatusBadges';

interface AnnouncementsTableProps {
  rows: AnnouncementRow[];
  query: string;
  onQueryChange: (value: string) => void;
  typeFilter?: AnnouncementTypeFilter;
  onTypeFilterChange?: (value: AnnouncementTypeFilter) => void;
  onCreate: () => void;
  onView: (row: AnnouncementRow) => void;
  onEdit: (row: AnnouncementRow) => void;
  onDelete?: (row: AnnouncementRow) => void;
  loading?: boolean;
  embedded?: boolean;
}

const AnnouncementsTable: FunctionComponent<AnnouncementsTableProps> = ({
  rows,
  query,
  onQueryChange,
  typeFilter = 'all',
  onTypeFilterChange,
  onCreate,
  onView,
  onEdit,
  onDelete,
  loading,
  embedded,
}) => {
  const { t } = useTranslation();
  const { tableColumn, emptyState } = useAdminCopy();

  const body = (
    <div className={`box-border w-full min-w-0 shrink-0 px-4 pb-6 pt-4 sm:px-6 ${loading ? 'opacity-60' : ''}`}>
      <div className="space-y-3 lg:hidden">
        {rows.length === 0 ? (
          <AdminEmptyState title={emptyState('announcementsFilters')} />
        ) : (
          rows.map((row) => (
            <AdminMobileRowCard
              key={row.id}
              title={row.title}
              badges={
                <span className={announcementTypeTableBadge(row.type)}>
                    {row.type}
                </span>
              }
              fields={[
                {
                  label: tableColumn('audience'),
                  value: (
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      {row.targetAudience}
                    </span>
                  ),
                },
                {
                  label: tableColumn('date'),
                  value: (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} aria-hidden />
                      {row.date}
                    </span>
                  ),
                },
              ]}
              actions={
                <AdminRowActions
                  variant="mobile"
                  onView={() => onView(row)}
                  onEdit={() => onEdit(row)}
                  onDelete={onDelete ? () => onDelete(row) : undefined}
                />
              }
            />
          ))
        )}
      </div>

      <div className="admin-module-table-wrap hidden lg:block">
        <AdminTableScroll minWidth="880px" className="admin-table-scroll--panel">
          <thead>
            <tr className="box-border h-10 border-b border-solid border-[var(--admin-border)]">
              <th className="box-border py-2.5 pl-2 pr-2 text-start align-middle font-medium leading-num-20">{tableColumn('title')}</th>
              <th className="box-border py-2.5 pl-2 pr-2 text-start align-middle font-medium leading-num-20">{tableColumn('type')}</th>
              <th className="box-border py-2.5 pl-2 pr-2 text-start align-middle font-medium leading-num-20">{tableColumn('targetAudience')}</th>
              <th className="box-border py-2.5 pl-2 pr-2 text-start align-middle font-medium leading-num-20">{tableColumn('date')}</th>
              <th className="box-border py-2.5 pl-2 pr-2 text-end align-middle font-medium leading-num-20">{tableColumn('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <AdminTableEmptyState colSpan={5} title={emptyState('announcementsFilters')} />
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="box-border h-[49px] border-b border-solid border-[var(--admin-border)] last:border-b-0">
                  <td className="box-border max-w-0 overflow-hidden text-ellipsis py-3 pl-2 pr-2 align-middle font-medium leading-num-20">
                    <span className="line-clamp-2">{row.title}</span>
                  </td>
                  <td className="box-border whitespace-nowrap py-3 pl-2 pr-2 align-middle">
                    <span className={announcementTypeTableBadge(row.type)}>{row.type}</span>
                  </td>
                  <td className="box-border py-3 pl-2 pr-2 align-middle">
                    <div className="flex h-5 items-center gap-1.5 pl-0 leading-num-20">
                      <User className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} />
                      <span className="truncate font-normal">{row.targetAudience}</span>
                    </div>
                  </td>
                  <td className="box-border whitespace-nowrap py-3 pl-2 pr-2 align-middle">
                    <div className="flex h-5 items-center gap-1.5 leading-num-20">
                      <Calendar className="h-4 w-4 shrink-0 text-[var(--admin-text-secondary)]" strokeWidth={1.75} />
                      <span className="font-normal">{row.date}</span>
                    </div>
                  </td>
                  <td className="box-border py-2 pl-2 pr-2 align-middle">
                    <AdminRowActions
                      onView={() => onView(row)}
                      onEdit={() => onEdit(row)}
                      onDelete={onDelete ? () => onDelete(row) : undefined}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTableScroll>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <>
        <AdminModuleHeader
          layout="toolbar"
          title={t('admin.modules.announcements.recentTitle', { defaultValue: 'Recent announcements' })}
          actions={
            <AnnouncementsToolbar
              query={query}
              onQueryChange={onQueryChange}
              typeFilter={typeFilter}
              onTypeFilterChange={onTypeFilterChange ?? (() => undefined)}
              onCreate={onCreate}
            />
          }
        />
        {body}
      </>
    );
  }

  return (
    <AdminModulePanel
      className="font-inter text-num-14 leading-num-20 text-[var(--admin-text)]"
      header={
        <AdminModuleHeader
          layout="toolbar"
          title={t('admin.modules.announcements.title')}
          subtitle={t('admin.modules.announcements.subtitle')}
          actions={
            <AnnouncementsToolbar
              query={query}
              onQueryChange={onQueryChange}
              typeFilter={typeFilter}
              onTypeFilterChange={onTypeFilterChange ?? (() => undefined)}
              onCreate={onCreate}
            />
          }
        />
      }
    >
      {body}
    </AdminModulePanel>
  );
};

export default AnnouncementsTable;
