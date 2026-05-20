import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Calendar, Eye, MousePointerClick, Users } from 'lucide-react';
import type { AnnouncementDetailResponse, AnnouncementPriority, AnnouncementStatus } from '../types/announcement';
import { typeIcon } from '../utils/announcementMeta';
import AnnouncementStatusBadge from './AnnouncementStatusBadge';
import AnnouncementPriorityBadge from './AnnouncementPriorityBadge';

interface Props {
  data: AnnouncementDetailResponse;
}

function annField(data: AnnouncementDetailResponse, key: string): string {
  const a = data.announcement as Record<string, unknown>;
  const v = a[key];
  return v != null ? String(v) : '';
}

const AnnouncementDetailView: FunctionComponent<Props> = ({ data }) => {
  const { t } = useTranslation();
  const a = data.announcement as Record<string, unknown>;
  const typeCode = annField(data, 'type_code') || annField(data, 'typeCode');
  const TypeIcon = typeIcon(typeCode || 'other');
  const status = annField(data, 'status') as AnnouncementStatus;
  const priority = annField(data, 'priority') as AnnouncementPriority;
  const body = annField(data, 'body') || annField(data, 'summary');

  return (
    <div className="admin-ann-detail">
      <article className="admin-ann-detail-hero">
        <div className="admin-ann-detail-hero__cover flex items-center justify-center">
          <TypeIcon className="h-16 w-16 text-[var(--admin-brand)] opacity-50" aria-hidden />
        </div>
        <div className="admin-ann-detail-hero__body">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <AnnouncementStatusBadge status={status} />
            <AnnouncementPriorityBadge priority={priority} />
          </div>
          <h1 className="text-xl font-bold text-[var(--admin-text)]">{annField(data, 'title')}</h1>
          {annField(data, 'company_name') ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--admin-text-secondary)]">
              <Building2 className="h-4 w-4" aria-hidden />
              {annField(data, 'company_name')}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--admin-text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" aria-hidden />
              {Number(a.view_count ?? 0)} {t('admin.announcementsModule.detail.views')}
            </span>
            <span className="inline-flex items-center gap-1">
              <MousePointerClick className="h-4 w-4" aria-hidden />
              {Number(a.click_count ?? 0)} {t('admin.announcementsModule.detail.clicks')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden />
              {data.audienceCount} {t('admin.announcementsModule.detail.audience')}
            </span>
            {annField(data, 'application_deadline') ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden />
                {new Date(annField(data, 'application_deadline')).toLocaleDateString()}
              </span>
            ) : null}
          </div>
        </div>
      </article>

      <div className="admin-ann-detail-grid">
        <section className="admin-ann-detail-panel">
          <h2 className="admin-ann-panel-title mb-3">{t('admin.announcementsModule.detail.content')}</h2>
          <div
            className="prose prose-sm max-w-none text-[var(--admin-text-secondary)]"
            dangerouslySetInnerHTML={{
              __html: body || `<p>${t('admin.announcementsModule.detail.noBody')}</p>`,
            }}
          />
        </section>
        <aside className="flex flex-col gap-4">
          <section className="admin-ann-detail-panel">
            <h2 className="admin-ann-panel-title mb-3">{t('admin.announcementsModule.detail.targeting')}</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              {t(`admin.announcementsModule.scopes.${annField(data, 'target_scope')}`, {
                defaultValue: annField(data, 'target_scope'),
              })}
            </p>
          </section>
          {data.publicationHistory?.length ? (
            <section className="admin-ann-detail-panel">
              <h2 className="admin-ann-panel-title mb-3">{t('admin.announcementsModule.detail.timeline')}</h2>
              <ul className="space-y-2 text-sm">
                {data.publicationHistory.map((log, i) => (
                  <li
                    key={i}
                    className="border-s-2 border-[var(--admin-brand)] ps-3 text-[var(--admin-text-secondary)]"
                  >
                    <span className="font-semibold text-[var(--admin-text)]">{log.action}</span>
                    <br />
                    <time dateTime={log.created_at}>{new Date(log.created_at).toLocaleString()}</time>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

export default AnnouncementDetailView;
