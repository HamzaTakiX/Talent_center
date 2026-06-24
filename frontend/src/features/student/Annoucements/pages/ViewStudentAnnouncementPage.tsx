import { FunctionComponent, useCallback, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import BackButtonRow from '../../../../shared/navigation/BackButtonRow';
import { useBackNavigation } from '../../../../shared/navigation/useBackNavigation';
import AnnouncementDetailSkeleton from '../../../admin/announcements-stage/components/AnnouncementDetailSkeleton';
import AnnouncementDetailView from '../../../admin/announcements-stage/components/AnnouncementDetailView';
import AnnouncementPriorityBadge from '../../../admin/announcements-stage/components/AnnouncementPriorityBadge';
import AnnouncementsPremiumEmpty from '../../../admin/announcements-stage/components/AnnouncementsPremiumEmpty';
import { typeIcon } from '../../../admin/announcements-stage/utils/announcementMeta';
import { buildAnnouncementDetailViewModel } from '../../../admin/announcements-stage/utils/announcementDetailViewModel';
import StudentLayout from '../../components/StudentLayout';
import AnnouncementCardActions from '../components/AnnouncementCardActions';
import { ANNOUNCEMENTS_PAGE_ROOT, STUDENT_BACK_NAV_BUTTON } from '../constants/announcementsLayout';
import {
  STUDENT_ANNOUNCEMENTS_CHAT_PATH,
  STUDENT_ANNOUNCEMENTS_PATH,
} from '../constants/routes';
import { useStudentAnnouncementDetail } from '../hooks/useStudentAnnouncementDetail';
import { studentAnnouncementsApi } from '../api/studentAnnouncementsApi';
import '../../../admin/announcements-stage/styles/admin-announcements.css';

function readFlag(raw: Record<string, unknown>, key: string): boolean {
  return Boolean(raw[key]);
}

const ViewStudentAnnouncementPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { BackIcon, controlClassName } = useBackNavigation();
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refresh } = useStudentAnnouncementDetail(id);

  const model = useMemo(
    () => (data ? buildAnnouncementDetailViewModel(data) : null),
    [data],
  );

  const announcementRaw = (data?.announcement ?? {}) as Record<string, unknown>;
  const typeIconKey = typeof announcementRaw.typeIcon === 'string' ? announcementRaw.typeIcon : '';
  const typeColor = typeof announcementRaw.typeColor === 'string' ? announcementRaw.typeColor : '';
  const TypeIcon = typeIcon({ code: model?.typeCode ?? '', icon: typeIconKey });
  const typeLabel = model?.typeName || model?.typeCode || '';

  const goBack = useCallback(() => {
    navigate(STUDENT_ANNOUNCEMENTS_PATH);
  }, [navigate]);

  const handleAskQuestion = useCallback(() => {
    if (!id) return;
    navigate(`${STUDENT_ANNOUNCEMENTS_CHAT_PATH}?announcement=${id}`);
  }, [id, navigate]);

  const handleTrackClick = useCallback(
    (payload: { url: string; label?: string; source: 'link' | 'attachment' }) => {
      if (!id) return;
      void studentAnnouncementsApi.recordEngagement(id, payload).catch(() => undefined);
    },
    [id],
  );

  if (!id) {
    return <Navigate to={STUDENT_ANNOUNCEMENTS_PATH} replace />;
  }

  return (
    <StudentLayout>
      <div
        id="student-announcement-detail-root"
        className={`${ANNOUNCEMENTS_PAGE_ROOT} admin-ann-workspace admin-ann-view-page`}
      >
        <BackButtonRow>
          <button
            type="button"
            onClick={goBack}
            className={`${STUDENT_BACK_NAV_BUTTON} ${controlClassName} group`}
          >
            <span className="student-back-nav-icon" aria-hidden>
              <BackIcon
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
                strokeWidth={2.25}
              />
            </span>
            <span className="min-w-0 break-words">
              {t('student.announcements.detail.backToList', { defaultValue: 'Retour aux annonces' })}
            </span>
          </button>
        </BackButtonRow>

        {!loading && model ? (
          <>
            <nav className="admin-ann-view-breadcrumb" aria-label="Breadcrumb">
              <button type="button" onClick={goBack}>
                {t('student.announcements.detail.breadcrumb', { defaultValue: 'Annonces' })}
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
                  <span
                    className="admin-ann-detail-chip admin-ann-detail-chip--type"
                    style={
                      typeColor
                        ? {
                            backgroundColor: `color-mix(in srgb, ${typeColor} 14%, var(--admin-bg-elevated))`,
                            color: typeColor,
                            borderColor: `color-mix(in srgb, ${typeColor} 28%, var(--admin-border))`,
                          }
                        : undefined
                    }
                  >
                    <TypeIcon className="h-3.5 w-3.5" aria-hidden />
                    {typeLabel}
                  </span>
                  <AnnouncementPriorityBadge priority={model.priority} />
                </div>
              </div>

              <div className="admin-ann-view-toolbar__actions flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAskQuestion}
                  className="isi-header-btn isi-header-btn--accent inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <MessageSquare className="size-4" aria-hidden />
                  {t('student.announcements.commentAction', { defaultValue: 'Poser une question' })}
                </button>
                <AnnouncementCardActions
                  announcementId={id}
                  initialSaved={readFlag(announcementRaw, 'isSaved')}
                  initialFavorited={readFlag(announcementRaw, 'isFavorited')}
                />
              </div>
            </header>
          </>
        ) : null}

        {loading ? (
          <AnnouncementDetailSkeleton />
        ) : data && model ? (
          <AnnouncementDetailView data={data} variant="student" onTrackClick={handleTrackClick} />
        ) : (
          <AnnouncementsPremiumEmpty
            variant="list"
            title={t('student.announcements.detail.loadErrorTitle', {
              defaultValue: 'Annonce introuvable',
            })}
            subtitle={t('student.announcements.detail.loadErrorSubtitle', {
              defaultValue: "Cette annonce n'est plus disponible ou vous n'y avez pas accès.",
            })}
            onAction={error ? refresh : goBack}
            actionLabel={
              error
                ? t('student.announcements.detail.retry', { defaultValue: 'Réessayer' })
                : t('student.announcements.detail.backToList', { defaultValue: 'Retour aux annonces' })
            }
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default ViewStudentAnnouncementPage;
