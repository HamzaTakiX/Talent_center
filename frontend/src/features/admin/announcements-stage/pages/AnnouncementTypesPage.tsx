import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { AdminListPageShell, AdminModuleHeader, AdminModulePanel } from '../../ui';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import AdminRowActionsMenu from '../../ui/AdminRowActionsMenu';
import { adminAnnouncementsApi } from '../../api/announcements';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import AnnouncementTypeFormDialog from '../components/AnnouncementTypeFormDialog';
import type { AnnouncementTypeItem, AnnouncementTypeWritePayload } from '../types/announcement';
import { resolveAnnouncementTypeIcon } from '../utils/announcementTypeIcons';
import { priorityMeta } from '../utils/announcementMeta';
import { dispatchAnnouncementTypesChanged } from '../constants/announcementTypesEvents';
import '../styles/admin-announcements.css';

const P = 'admin.announcementsModule.types';

const AnnouncementTypesPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useAdminToast();
  const [types, setTypes] = useState<AnnouncementTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<AnnouncementTypeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementTypeItem | null>(null);
  const [seeding, setSeeding] = useState(false);

  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAnnouncementsApi.types(true);
      setTypes(data);
    } catch {
      toast.showToast(t(`${P}.loadError`), 'error');
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    void loadTypes();
  }, [loadTypes]);

  const openCreate = () => {
    setFormMode('create');
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: AnnouncementTypeItem) => {
    setFormMode('edit');
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: AnnouncementTypeWritePayload) => {
    try {
      if (formMode === 'create') {
        await adminAnnouncementsApi.createType(payload);
        toast.showToast(t(`${P}.created`), 'success');
      } else if (editing) {
        await adminAnnouncementsApi.updateType(editing.id, payload);
        toast.showToast(t(`${P}.updated`), 'success');
      }
      await loadTypes();
      dispatchAnnouncementTypesChanged();
    } catch {
      toast.showToast(t(`${P}.saveError`), 'error');
      throw new Error('save failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await adminAnnouncementsApi.deleteType(deleteTarget.id);
      const msg = res.message?.toLowerCase().includes('deactiv')
        ? t(`${P}.deactivated`)
        : t(`${P}.deleted`);
      toast.showToast(msg, 'success');
      await loadTypes();
      dispatchAnnouncementTypesChanged();
    } catch {
      toast.showToast(t(`${P}.deleteError`), 'error');
      throw new Error('delete failed');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await adminAnnouncementsApi.seedTypes();
      toast.showToast(t(`${P}.seeded`), 'success');
      await loadTypes();
      dispatchAnnouncementTypesChanged();
    } catch {
      toast.showToast(t(`${P}.seedError`), 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AdminListPageShell onBack={() => navigate('/admin/announcements')} backTo="announcements">
      <AdminModulePanel
        className="overflow-hidden"
        header={
          <AdminModuleHeader
            title={t(`${P}.title`)}
            subtitle={t(`${P}.subtitle`)}
            layout="toolbar"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => void handleSeed()}
                  disabled={seeding}
                >
                  {seeding ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden />
                  )}
                  {t(`${P}.seed`)}
                </button>
                <button type="button" className="admin-table-btn admin-table-btn--primary" onClick={openCreate}>
                  <Plus className="h-4 w-4" aria-hidden />
                  {t(`${P}.add`)}
                </button>
              </div>
            }
          />
        }
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-[var(--admin-text-muted)]">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            {t('common.loading', { defaultValue: 'Chargement…' })}
          </div>
        ) : types.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--admin-text-muted)]">{t(`${P}.empty`)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)] text-[var(--admin-text-muted)]">
                  <th className="text-start p-3 w-14">{t(`${P}.columns.icon`)}</th>
                  <th className="text-start p-3">{t(`${P}.columns.name`)}</th>
                  <th className="text-start p-3">{t(`${P}.columns.code`)}</th>
                  <th className="text-start p-3">{t(`${P}.columns.priority`)}</th>
                  <th className="text-start p-3">{t(`${P}.columns.flags`)}</th>
                  <th className="text-start p-3">{t(`${P}.columns.usage`)}</th>
                  <th className="text-end p-3 w-16">{t(`${P}.columns.actions`)}</th>
                </tr>
              </thead>
              <tbody>
                {types.map((tp) => {
                  const Icon = resolveAnnouncementTypeIcon(tp.icon);
                  const PriorityIcon = priorityMeta[tp.default_priority]?.icon;
                  return (
                    <tr
                      key={tp.id}
                      className={`border-b border-[var(--admin-border)] hover:bg-[var(--admin-brand-soft)]/30 ${!tp.is_active ? 'opacity-55' : ''}`}
                    >
                      <td className="p-3">
                        <span
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${tp.color || '#2563eb'}22`,
                            color: tp.color || '#2563eb',
                          }}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-[var(--admin-text)]">{tp.nameLocalized}</div>
                        {tp.is_system ? (
                          <span className="text-xs text-[var(--admin-text-muted)]">{t(`${P}.systemBadge`)}</span>
                        ) : null}
                        {!tp.is_active ? (
                          <span className="ms-2 text-xs text-amber-600">{t(`${P}.inactiveBadge`)}</span>
                        ) : null}
                      </td>
                      <td className="p-3 font-mono text-xs text-[var(--admin-text-secondary)]">{tp.code}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5">
                          {PriorityIcon ? (
                            <PriorityIcon className="h-3.5 w-3.5 text-[var(--admin-text-muted)]" aria-hidden />
                          ) : null}
                          {t(`admin.announcementsModule.types.priorities.${tp.default_priority}`, {
                            defaultValue: tp.default_priority,
                          })}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-[var(--admin-text-secondary)]">
                        <div className="flex flex-wrap gap-1">
                          {tp.is_mutable ? <span className="admin-ann-chip">{t(`${P}.flags.mutable`)}</span> : null}
                          {tp.is_bannable ? <span className="admin-ann-chip">{t(`${P}.flags.bannable`)}</span> : null}
                          {tp.is_internship_related ? (
                            <span className="admin-ann-chip">{t(`${P}.flags.internship`)}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-3 text-[var(--admin-text-secondary)]">
                        {tp.announcementCount ?? 0}
                      </td>
                      <td className="p-3 text-end">
                        <AdminRowActionsMenu
                          ariaLabel={t(`${P}.actionsAria`, { name: tp.nameLocalized })}
                          onEdit={() => openEdit(tp)}
                          onDelete={() => setDeleteTarget(tp)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminModulePanel>

      <AnnouncementTypeFormDialog
        open={formOpen}
        mode={formMode}
        item={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <AdminDeleteConfirmModal
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t(`${P}.delete.title`)}
        description={
          deleteTarget?.announcementCount
            ? t(`${P}.delete.usedDescription`, { count: deleteTarget.announcementCount })
            : t(`${P}.delete.description`)
        }
        confirmLabel={t(`${P}.delete.confirm`)}
      />
    </AdminListPageShell>
  );
};

export default AnnouncementTypesPage;
