import { FunctionComponent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Copy,
  Eye,
  Pencil,
  Play,
  Trash2,
  XCircle,
} from 'lucide-react';
import { adminCrudRoutes } from '../../shared/navigation/adminCrudRoutes';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import { AdminTableScroll } from '../../ui';
import AnnouncementsPremiumEmpty from './AnnouncementsPremiumEmpty';
import { SafeText, SafeTitleCell, ADMIN_TABLE_COL } from '../../../../design-system/safeContent';
import { adminTableBtn, adminTableBtnDelete, adminTableBtnMobile, adminTableBtnMobileDanger } from '../../ui/adminTableButtons';
import { formatListDate, formatListTime } from '../utils/scheduleUtils';
import { statusMeta } from '../utils/announcementMeta';
import type { AnnouncementListItem } from '../types/announcement';
import { adminAnnouncementsApi } from '../../api/announcements';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';

interface Props {
  items: AnnouncementListItem[];
  onChanged?: () => void | Promise<void>;
  hasFilters?: boolean;
}

const ScheduledAnnouncementsTable: FunctionComponent<Props> = ({ items, onChanged, hasFilters = false }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useAdminToast();
  const locale = i18n.language?.startsWith('ar') ? 'ar-MA' : i18n.language?.startsWith('en') ? 'en-GB' : 'fr-FR';
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const runAction = useCallback(
    async (id: string, action: string, successKey: string) => {
      setBusyId(id);
      try {
        await adminAnnouncementsApi.action(id, action);
        toast.success(t(successKey));
        await onChanged?.();
      } catch {
        toast.error(t('common.error', { defaultValue: 'Error' }));
      } finally {
        setBusyId(null);
      }
    },
    [onChanged, t, toast],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setBusyId(deleteId);
    try {
      await adminAnnouncementsApi.remove(deleteId);
      toast.success(t('admin.announcementsModule.actions.delete.success'));
      setDeleteId(null);
      await onChanged?.();
    } catch {
      toast.error(t('admin.announcementsModule.actions.delete.errors.failed'));
    } finally {
      setBusyId(null);
    }
  }, [deleteId, onChanged, t, toast]);

  const renderActions = (item: AnnouncementListItem, mobile = false) => {
    const disabled = busyId === item.id;
    const btn = mobile ? adminTableBtnMobile : adminTableBtn;
    const dangerBtn = mobile ? adminTableBtnMobileDanger : adminTableBtnDelete;
    return (
      <>
        <button type="button" className={btn} disabled={disabled} onClick={() => navigate(`/admin/announcements/${item.id}`)}>
          <Eye className="h-4 w-4 shrink-0" aria-hidden />
          {t('admin.announcementsModule.scheduled.actions.view')}
        </button>
        <button type="button" className={btn} disabled={disabled} onClick={() => navigate(adminCrudRoutes.announcementEdit(item.id))}>
          <Pencil className="h-4 w-4 shrink-0" aria-hidden />
          {t('admin.announcementsModule.scheduled.actions.edit')}
        </button>
        {item.status === 'SCHEDULED' ? (
          <>
            <button type="button" className={btn} disabled={disabled} onClick={() => runAction(item.id, 'publish', 'admin.announcementsModule.scheduled.actions.publishNowSuccess')}>
              <Play className="h-4 w-4 shrink-0" aria-hidden />
              {t('admin.announcementsModule.scheduled.actions.publishNow')}
            </button>
            <button type="button" className={btn} disabled={disabled} onClick={() => runAction(item.id, 'cancel-schedule', 'admin.announcementsModule.scheduled.actions.cancelSuccess')}>
              <XCircle className="h-4 w-4 shrink-0" aria-hidden />
              {t('admin.announcementsModule.scheduled.actions.cancelSchedule')}
            </button>
          </>
        ) : null}
        <button type="button" className={btn} disabled={disabled} onClick={() => runAction(item.id, 'duplicate', 'admin.announcementsModule.scheduled.actions.duplicateSuccess')}>
          <Copy className="h-4 w-4 shrink-0" aria-hidden />
          {t('admin.announcementsModule.scheduled.actions.duplicate')}
        </button>
        <button type="button" className={dangerBtn} disabled={disabled} onClick={() => setDeleteId(item.id)}>
          <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
          {t('admin.announcementsModule.scheduled.actions.delete')}
        </button>
      </>
    );
  };

  return (
    <>
      <AdminDeleteConfirmModal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('admin.announcementsModule.actions.delete.title')}
        description={t('admin.announcementsModule.actions.delete.description')}
        confirmLabel={t('admin.announcementsModule.actions.delete.confirm')}
      />

      <div className="admin-ann-scheduled-mobile-list lg:hidden">
        {items.length === 0 ? (
          <AnnouncementsPremiumEmpty
            variant={hasFilters ? 'search' : 'list'}
            title={t('admin.announcementsModule.scheduled.emptyTitle')}
            subtitle={t('admin.announcementsModule.scheduled.emptySubtitle')}
          />
        ) : (
          items.map((item) => (
            <article key={item.id} className="admin-ann-scheduled-mobile-card">
              <h3 className="font-semibold"><SafeText>{item.title}</SafeText></h3>
              <p className="text-sm text-[var(--admin-text-secondary)]">{item.typeName}</p>
              <p className="text-sm">{item.targetAudienceLabel || item.target_scope}</p>
              <p className="inline-flex items-center gap-1.5 text-sm">
                <Calendar className="h-4 w-4" aria-hidden />
                {formatListDate(item.publish_start_at, locale)} · {formatListTime(item.publish_start_at, item.scheduleTimezone, locale)}
              </p>
              <span className={`admin-ann-status-badge ${statusMeta[item.status]?.badgeClass ?? 'admin-ann-status--draft'}`}>{t(`admin.announcementsModule.status.${item.status}`)}</span>
              <div className="flex flex-wrap gap-2 pt-2">{renderActions(item, true)}</div>
            </article>
          ))
        )}
      </div>

      <div className="admin-module-table-wrap hidden lg:block">
        <AdminTableScroll minWidth="1080px" className="admin-table-scroll--panel">
          <thead>
            <tr className="border-b border-[var(--admin-border)]">
              <th className={`py-2.5 pl-2 pr-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.title}`}>{t('admin.announcementsModule.scheduled.columns.title')}</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.status}`}>{t('admin.announcementsModule.scheduled.columns.category')}</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.text}`}>{t('admin.announcementsModule.scheduled.columns.audience')}</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.deadline}`}>{t('admin.announcementsModule.scheduled.columns.date')}</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.deadline}`}>{t('admin.announcementsModule.scheduled.columns.time')}</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.text}`}>{t('admin.announcementsModule.scheduled.columns.createdBy')}</th>
              <th className={`py-2.5 px-4 text-left text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.status}`}>{t('admin.announcementsModule.scheduled.columns.status')}</th>
              <th className={`py-2.5 px-4 text-right text-sm font-medium text-[var(--admin-text-secondary)] ${ADMIN_TABLE_COL.actions}`}>{t('admin.announcementsModule.scheduled.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-0">
                  <AnnouncementsPremiumEmpty
                    variant={hasFilters ? 'search' : 'list'}
                    title={t('admin.announcementsModule.scheduled.emptyTitle')}
                    subtitle={t('admin.announcementsModule.scheduled.emptySubtitle')}
                  />
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--admin-border)] last:border-b-0">
                  <td className="max-w-0 py-3 pl-2 pr-4 align-middle font-medium"><SafeTitleCell>{item.title}</SafeTitleCell></td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle"><SafeText>{item.typeName}</SafeText></td>
                  <td className="px-4 py-3 align-middle"><SafeText>{item.targetAudienceLabel || item.target_scope}</SafeText></td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle">{formatListDate(item.publish_start_at, locale)}</td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle">{formatListTime(item.publish_start_at, item.scheduleTimezone, locale)}</td>
                  <td className="px-4 py-3 align-middle"><SafeText>{item.createdByName || '—'}</SafeText></td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle">
                    <span className={`admin-ann-status-badge ${statusMeta[item.status]?.badgeClass ?? 'admin-ann-status--draft'}`}>{t(`admin.announcementsModule.status.${item.status}`)}</span>
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <div className="flex flex-wrap items-center justify-end gap-2">{renderActions(item)}</div>
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

export default ScheduledAnnouncementsTable;
