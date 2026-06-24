import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Archive, ArchiveRestore, Pencil } from 'lucide-react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminBackButton from '../../ui/AdminBackButton';
import AdminButton from '../../ui/AdminButton';
import AdminDeleteConfirmModal from '../../ui/AdminDeleteConfirmModal';
import AdminRowActionsMenu from '../../ui/AdminRowActionsMenu';
import { adminCrudRoutes } from '../../shared/navigation/adminCrudRoutes';
import { adminAnnouncementsApi } from '../../api/announcements';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';
import AnnouncementDetailView from '../components/AnnouncementDetailView';
import AnnouncementDetailSkeleton from '../components/AnnouncementDetailSkeleton';
import AnnouncementsPremiumEmpty from '../components/AnnouncementsPremiumEmpty';
import AnnouncementStatusBadge from '../components/AnnouncementStatusBadge';
import { useAnnouncementDetail, useAnnouncementTypes } from '../hooks/useAnnouncements';
import { useAnnouncementMutation } from '../hooks/useAnnouncementMutation';
import { buildAnnouncementDetailViewModel } from '../utils/announcementDetailViewModel';
import { typeIcon } from '../utils/announcementMeta';
import '../styles/admin-announcements.css';

const ViewAnnouncementPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useAdminToast();
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refresh } = useAnnouncementDetail(id);
  const { typesByCode } = useAnnouncementTypes();
  const { deleteAnnouncement, unarchiveAnnouncement } = useAnnouncementMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const model = useMemo(
    () => (data ? buildAnnouncementDetailViewModel(data) : null),
    [data],
  );

  const goBack = () => navigate('/admin/announcements');

  const typeMeta = model ? typesByCode.get(model.typeCode) : undefined;
  const TypeIcon = typeIcon(typeMeta ?? model?.typeCode ?? '');
  const typeLabel = typeMeta?.nameLocalized || model?.typeName || model?.typeCode || '';

  const runAction = useCallback(
    async (action: string, successKey: string) => {
      if (!id) return;
      setActionBusy(true);
      try {
        await adminAnnouncementsApi.action(id, action);
        toast.success(t(successKey));
        await refresh();
      } catch {
        toast.error(t('common.error', { defaultValue: 'Error' }));
      } finally {
        setActionBusy(false);
      }
    },
    [id, refresh, t, toast],
  );

  const handleArchive = () => {
    if (!model || model.status === 'ARCHIVED') return;
    void runAction('archive', 'admin.announcementsModule.detail.archiveSuccess');
  };

  const handleUnarchive = () => {
    if (!id || !model || model.status !== 'ARCHIVED') return;
    setActionBusy(true);
    void unarchiveAnnouncement(id)
      .then(() => refresh())
      .finally(() => setActionBusy(false));
  };

  const handleDuplicate = () => {
    void runAction('duplicate', 'admin.announcementsModule.scheduled.actions.duplicateSuccess');
  };

  const handleDelete = useCallback(async () => {
    if (!id) return;
    await deleteAnnouncement(id);
    navigate('/admin/announcements');
  }, [deleteAnnouncement, id, navigate]);

  return (
    <AdminModulePageShell width="wide">
      <div className="admin-ann-workspace admin-ann-view-page">
        <AdminBackButton
          onClick={goBack}
          label={t('admin.announcementsModule.detail.backToList')}
        />

        {!loading && model ? (
          <>
            <nav className="admin-ann-view-breadcrumb" aria-label="Breadcrumb">
              <button type="button" onClick={goBack}>
                {t('admin.common.breadcrumbs.announcements')}
              </button>
              <span className="admin-ann-view-breadcrumb__sep" aria-hidden>
                ›
              </span>
              <span className="admin-ann-view-breadcrumb__current">{model.title}</span>
            </nav>

            <header className="admin-ann-view-toolbar">
              <div className="admin-ann-view-toolbar__main">
                <h1 className="admin-ann-view-toolbar__title">{model.title}</h1>
                <div className="admin-ann-view-toolbar__badges">
                  <AnnouncementStatusBadge status={model.status} size="md" />
                  <span className="admin-ann-detail-chip admin-ann-detail-chip--type">
                    <TypeIcon className="h-3.5 w-3.5" aria-hidden />
                    {typeLabel}
                  </span>
                </div>
              </div>

              <div className="admin-ann-view-toolbar__actions">
                {id ? (
                  <>
                    <AdminButton
                      variant="primary"
                      size="sm"
                      disabled={actionBusy}
                      onClick={() => navigate(adminCrudRoutes.announcementEdit(id))}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                      {t('admin.announcementsModule.detail.edit')}
                    </AdminButton>
                    {model.status !== 'ARCHIVED' ? (
                      <AdminButton
                        variant="outline"
                        size="sm"
                        disabled={actionBusy}
                        onClick={handleArchive}
                      >
                        <Archive className="h-4 w-4" aria-hidden />
                        {t('admin.common.actions.archive')}
                      </AdminButton>
                    ) : (
                      <AdminButton
                        variant="outline"
                        size="sm"
                        disabled={actionBusy}
                        onClick={handleUnarchive}
                      >
                        <ArchiveRestore className="h-4 w-4" aria-hidden />
                        {t('admin.announcementsModule.archived.unarchive')}
                      </AdminButton>
                    )}
                    <AdminRowActionsMenu
                      ariaLabel={t('admin.announcementsModule.actions.menuAria', {
                        title: model.title,
                      })}
                      onDuplicate={handleDuplicate}
                      onDelete={() => setDeleteOpen(true)}
                    />
                  </>
                ) : null}
              </div>
            </header>
          </>
        ) : null}

        {loading ? (
          <AnnouncementDetailSkeleton />
        ) : data && model ? (
          <AnnouncementDetailView data={data} />
        ) : (
          <AnnouncementsPremiumEmpty
            variant="list"
            title={t('admin.announcementsModule.detail.loadErrorTitle')}
            subtitle={t('admin.announcementsModule.detail.loadErrorSubtitle')}
            onAction={error ? refresh : goBack}
            actionLabel={
              error
                ? t('admin.announcementsModule.detail.retry')
                : t('admin.announcementsModule.detail.backToList')
            }
          />
        )}
      </div>

      {model && id ? (
        <AdminDeleteConfirmModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title={t('admin.announcementsModule.actions.delete.title')}
          description={t('admin.announcementsModule.actions.delete.description')}
          confirmLabel={t('admin.announcementsModule.actions.delete.confirm')}
        />
      ) : null}
    </AdminModulePageShell>
  );
};

export default ViewAnnouncementPage;
