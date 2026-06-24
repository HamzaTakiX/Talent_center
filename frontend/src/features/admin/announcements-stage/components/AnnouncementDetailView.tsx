import { FunctionComponent, useMemo, type CSSProperties, type LucideIcon, type MouseEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AlarmClock,
  BarChart3,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  CircleDot,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  Globe2,
  History,
  Info,
  Link2,
  Mail,
  MousePointerClick,
  Paperclip,
  Pin,
  Radio,
  ScrollText,
  Tag,
  User,
  Users,
} from 'lucide-react';
import type { AnnouncementDetailResponse } from '../types/announcement';
import type { StudentAnnouncementInternshipDetails } from '../../../student/Annoucements/types';
import { useAnnouncementTypes } from '../hooks/useAnnouncements';
import { useAcademicStructureCatalog } from '../../shared/academic-structure/hooks/useAcademicStructureCatalog';
import {
  buildAnnouncementDetailViewModel,
  collectAnnouncementUrlLinks,
  fileAttachmentsOnly,
  formatAnnouncementDate,
  formatAnnouncementDateShort,
} from '../utils/announcementDetailViewModel';
import { mapAnnouncementTargetsToTargetingRules } from '../utils/announcementTargetingMappers';
import { typeIcon } from '../utils/announcementMeta';
import AnnouncementPriorityBadge from './AnnouncementPriorityBadge';
import AnnouncementStatusBadge from './AnnouncementStatusBadge';
import AnnouncementAttachmentPreviewCard from './AnnouncementAttachmentPreviewCard';
import AnnouncementEmailPreview from './AnnouncementEmailPreview';
import AnnouncementDetailSectionEmpty from './AnnouncementDetailSectionEmpty';
import { fadeInUp, staggerContainer } from '../../dashboard/ui/animations';

const TARGETING_PREFIX = 'admin.forms.createOfferStudio.targeting';

const PERFORMANCE_ACCENTS: Record<string, { accent: string; icon: LucideIcon }> = {
  views: { accent: '#2563eb', icon: Eye },
  clicks: { accent: '#7c3aed', icon: MousePointerClick },
  downloads: { accent: '#16a34a', icon: Download },
  reach: { accent: '#0891b2', icon: Users },
};

interface Props {
  data: AnnouncementDetailResponse;
  variant?: 'admin' | 'student';
  onTrackClick?: (payload: { url: string; label?: string; source: 'link' | 'attachment' }) => void;
}

function DetailSectionHeader({
  icon: Icon,
  title,
  accent = 'var(--admin-brand)',
}: {
  icon: LucideIcon;
  title: string;
  accent?: string;
}) {
  return (
    <div className="admin-ann-detail-section-head">
      <span
        className="admin-ann-detail-section-head__icon"
        style={{
          color: accent,
          background: `color-mix(in srgb, ${accent} 12%, var(--admin-bg-elevated))`,
          borderColor: `color-mix(in srgb, ${accent} 22%, var(--admin-border))`,
        }}
        aria-hidden
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <h2 className="admin-ann-detail-section-title">{title}</h2>
    </div>
  );
}

function AudiencePillGroup({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="admin-ann-detail-audience-group">
      <span className="admin-ann-detail-audience-group__label">{label}</span>
      <div className="admin-ann-detail-audience-group__pills">
        {items.map((item) => (
          <span key={item} className="admin-ann-detail-audience-pill">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="admin-ann-detail-meta-row">
      <dt>
        <span className="admin-ann-detail-meta-row__icon" aria-hidden>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <span>{label}</span>
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

function PerformanceStat({
  statKey,
  label,
  value,
}: {
  statKey: string;
  label: string;
  value: string;
}) {
  const meta = PERFORMANCE_ACCENTS[statKey] ?? PERFORMANCE_ACCENTS.views;
  const Icon = meta.icon;
  const numeric = Number(value);
  const isEmpty = !Number.isFinite(numeric) || numeric <= 0;

  return (
    <div
      className={`admin-ann-detail-performance__stat${isEmpty ? ' admin-ann-detail-performance__stat--empty' : ''}`}
      style={{ '--perf-accent': meta.accent } as CSSProperties}
    >
      <div className="admin-ann-detail-performance__head">
        <span className="admin-ann-detail-performance__icon" aria-hidden>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="admin-ann-detail-performance__label">{label}</span>
      </div>
      <strong className="admin-ann-detail-performance__value">{value}</strong>
    </div>
  );
}

const AnnouncementDetailView: FunctionComponent<Props> = ({ data, variant = 'admin', onTrackClick }) => {
  const { t, i18n } = useTranslation();
  const isStudent = variant === 'student';
  const { typesByCode } = useAnnouncementTypes();
  const { catalog } = useAcademicStructureCatalog();
  const model = useMemo(() => buildAnnouncementDetailViewModel(data), [data]);
  const locale = i18n.language;

  const announcementRaw = (data.announcement ?? {}) as Record<string, unknown>;
  const studentTypeIconKey =
    typeof announcementRaw.typeIcon === 'string' ? announcementRaw.typeIcon : '';
  const studentTypeColor =
    typeof announcementRaw.typeColor === 'string' ? announcementRaw.typeColor : '';

  const typeMeta = typesByCode.get(model.typeCode);
  const TypeIcon = typeIcon(
    isStudent
      ? { code: model.typeCode, icon: studentTypeIconKey }
      : (typeMeta ?? model.typeCode),
  );
  const typeLabel = typeMeta?.nameLocalized || model.typeName || model.typeCode;
  const typeAccent = (isStudent ? studentTypeColor : typeMeta?.color) || undefined;

  const targeting = useMemo(
    () => mapAnnouncementTargetsToTargetingRules(model.targets, catalog, locale),
    [catalog, locale, model.targets],
  );

  const isAllStudents = model.targetScope === 'ALL_STUDENTS' && model.targets.length === 0;
  const publicationDate = model.dates.publishedAt ?? model.dates.publishStartAt;
  const statusLabel = t(`admin.announcementsModule.status.${model.status}`, {
    defaultValue: model.status,
  });

  const studentInternshipDetails = useMemo((): StudentAnnouncementInternshipDetails | null => {
    if (!isStudent) return null;
    const raw = announcementRaw.internshipDetails;
    if (!raw || typeof raw !== 'object') return null;
    const row = raw as Record<string, unknown>;
    const details: StudentAnnouncementInternshipDetails = {
      duration: typeof row.duration === 'string' ? row.duration : '',
      location: typeof row.location === 'string' ? row.location : '',
      workMode: typeof row.workMode === 'string' ? row.workMode : '',
      compensation: typeof row.compensation === 'string' ? row.compensation : '',
      offerStatus: typeof row.offerStatus === 'string' ? row.offerStatus : '',
    };
    const hasContent = Object.values(details).some((value) => value.trim().length > 0);
    return hasContent ? details : null;
  }, [announcementRaw.internshipDetails, isStudent]);

  const studentDateRows = [
    {
      key: 'published',
      label: t('student.announcements.chat.fields.publishedAt', { defaultValue: 'Date de publication' }),
      value: formatAnnouncementDateShort(publicationDate, locale),
      icon: Calendar,
    },
    {
      key: 'deadline',
      label: t('student.announcements.chat.fields.deadline', { defaultValue: 'Date limite' }),
      value: formatAnnouncementDateShort(model.dates.applicationDeadline, locale),
      icon: AlarmClock,
    },
    {
      key: 'expiry',
      label: t('student.announcements.chat.fields.expiryDate', { defaultValue: "Date d'expiration" }),
      value: formatAnnouncementDateShort(model.dates.publishEndAt, locale),
      icon: CalendarOff,
    },
  ].filter((row) => row.value !== '—');

  const timelineActionLabel = (action: string) => {
    const key = `admin.announcementsModule.detail.timelineActions.${action}`;
    const label = t(key);
    return label === key ? action : label;
  };

  const performanceStats = [
    { key: 'views', value: String(model.stats.views) },
    { key: 'clicks', value: String(model.stats.clicks) },
    { key: 'downloads', value: String(model.stats.saves) },
    { key: 'reach', value: String(model.stats.audienceCount) },
  ];

  const externalLinkLabel = isStudent
    ? t('student.announcements.detail.externalLink', { defaultValue: 'Lien principal' })
    : t('admin.announcementsModule.detail.externalLink');

  const urlLinks = useMemo(
    () => collectAnnouncementUrlLinks(model, externalLinkLabel),
    [externalLinkLabel, model],
  );

  const fileAttachments = useMemo(() => fileAttachmentsOnly(model.attachments), [model.attachments]);

  const handleTrackedClick = (
    event: MouseEvent<HTMLAnchorElement>,
    payload: { url: string; label?: string; source: 'link' | 'attachment' },
  ) => {
    if (!onTrackClick) return;
    onTrackClick(payload);
  };

  const infoRows = [
    {
      key: 'type',
      label: t('admin.announcementsModule.detail.meta.type'),
      value: typeLabel,
      icon: Tag,
    },
    {
      key: 'author',
      label: t('admin.announcementsModule.detail.meta.author'),
      value: model.createdByName || '—',
      icon: User,
    },
    {
      key: 'published',
      label: t('admin.announcementsModule.detail.meta.publicationDate'),
      value: formatAnnouncementDateShort(publicationDate, locale),
      icon: Calendar,
    },
    {
      key: 'expiration',
      label: t('admin.announcementsModule.detail.meta.expiration'),
      value: formatAnnouncementDateShort(model.dates.publishEndAt, locale),
      icon: CalendarOff,
    },
    {
      key: 'timezone',
      label: t('admin.announcementsModule.detail.meta.timezone'),
      value: model.scheduleTimezone,
      icon: Globe2,
    },
    {
      key: 'updated',
      label: t('admin.announcementsModule.detail.meta.lastUpdated'),
      value: formatAnnouncementDateShort(model.dates.updatedAt, locale),
      icon: Clock3,
    },
  ];

  const publicationRows = [
    {
      key: 'status',
      label: t('admin.announcementsModule.detail.publication.status'),
      value: statusLabel,
      icon: CircleDot,
    },
    {
      key: 'start',
      label: t('admin.announcementsModule.detail.publication.start'),
      value: formatAnnouncementDate(model.dates.publishStartAt, locale),
      icon: CalendarClock,
    },
    {
      key: 'published',
      label: t('admin.announcementsModule.detail.publication.publishedAt'),
      value: formatAnnouncementDate(model.dates.publishedAt, locale),
      icon: CalendarCheck,
    },
    {
      key: 'end',
      label: t('admin.announcementsModule.detail.publication.end'),
      value: formatAnnouncementDate(model.dates.publishEndAt, locale),
      icon: CalendarOff,
    },
    {
      key: 'deadline',
      label: t('admin.announcementsModule.detail.meta.deadline'),
      value: formatAnnouncementDate(model.dates.applicationDeadline, locale),
      icon: AlarmClock,
    },
  ];

  return (
    <motion.div
      className="admin-ann-detail"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.article className="admin-ann-detail-hero" variants={fadeInUp}>
        <div
          className={`admin-ann-detail-hero__cover${model.coverImageUrl ? ' admin-ann-detail-hero__cover--image' : ''}`}
          style={
            !model.coverImageUrl && typeAccent
              ? {
                  background: `linear-gradient(135deg, color-mix(in srgb, ${typeAccent} 28%, var(--admin-bg-elevated)), color-mix(in srgb, var(--admin-brand) 16%, var(--admin-bg-elevated)))`,
                }
              : undefined
          }
        >
          {model.coverImageUrl ? (
            <img
              src={model.coverImageUrl}
              alt=""
              className="admin-ann-detail-hero__cover-img"
            />
          ) : (
            <div className="admin-ann-detail-hero__cover-fallback">
              <TypeIcon className="h-10 w-10 opacity-50" aria-hidden />
            </div>
          )}
          <div className="admin-ann-detail-hero__cover-overlay" aria-hidden />
          <div className="admin-ann-detail-hero__cover-badges">
            {!isStudent ? <AnnouncementStatusBadge status={model.status} /> : null}
            <AnnouncementPriorityBadge priority={model.priority} />
            <span className="admin-ann-detail-chip admin-ann-detail-chip--type">
              <TypeIcon className="h-3.5 w-3.5" aria-hidden />
              {typeLabel}
            </span>
            {model.isPinned ? (
              <span className="admin-ann-detail-chip">
                <Pin className="h-3.5 w-3.5" aria-hidden />
                {t('admin.announcementsModule.detail.pinned')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="admin-ann-detail-hero__body">
          {model.summary && model.summary !== model.title ? (
            <p className="admin-ann-detail-hero__summary">{model.summary}</p>
          ) : null}
          {!isStudent ? (
            <p className="admin-ann-detail-hero__status-line">
              <span className="admin-ann-detail-hero__status-label">{statusLabel}</span>
              {publicationDate ? (
                <>
                  <span aria-hidden>·</span>
                  <time dateTime={publicationDate}>
                    {formatAnnouncementDateShort(publicationDate, locale)}
                  </time>
                </>
              ) : null}
            </p>
          ) : publicationDate ? (
            <p className="admin-ann-detail-hero__status-line">
              <time dateTime={publicationDate}>
                {formatAnnouncementDateShort(publicationDate, locale)}
              </time>
            </p>
          ) : null}
          {(model.companyName || model.externalLink) && (
            <div className="admin-ann-detail-hero__meta">
              {model.companyName ? (
                <span className="admin-ann-detail-hero__meta-item">
                  <Building2 className="h-4 w-4 shrink-0" aria-hidden />
                  {model.companyName}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </motion.article>

      <div className="admin-ann-detail-grid">
        <motion.div className="admin-ann-detail-main" variants={fadeInUp}>
          <section className="admin-ann-detail-panel admin-ann-detail-panel--content">
            <DetailSectionHeader
              icon={ScrollText}
              title={t('admin.announcementsModule.detail.content')}
            />
            {model.body ? (
              model.bodyIsHtml ? (
                <div
                  className="admin-ann-detail-content prose prose-sm max-w-none break-words"
                  dangerouslySetInnerHTML={{ __html: model.body }}
                />
              ) : (
                <div className="admin-ann-detail-content admin-ann-detail-content--plain">
                  {model.body.split('\n').map((line, index) => (
                    <p key={index}>{line || '\u00A0'}</p>
                  ))}
                </div>
              )
            ) : (
              <AnnouncementDetailSectionEmpty
                icon={ScrollText}
                title={t('admin.announcementsModule.detail.noBody')}
                subtitle={t('admin.announcementsModule.detail.empty.contentSubtitle')}
              />
            )}
          </section>

          <section className="admin-ann-detail-panel">
            <div className="admin-ann-detail-panel__head">
              <DetailSectionHeader
                icon={Paperclip}
                title={t('admin.announcementsModule.detail.attachments')}
              />
              {fileAttachments.length > 0 ? (
                <span className="admin-ann-detail-count">{fileAttachments.length}</span>
              ) : null}
            </div>
            {fileAttachments.length > 0 ? (
              <div
                className="admin-ann-detail-attachments-track"
                role="list"
                aria-label={t('admin.announcementsModule.detail.attachments')}
              >
                {fileAttachments.map((attachment) => (
                  <AnnouncementAttachmentPreviewCard
                    key={attachment.id}
                    attachment={attachment}
                    downloadLabel={t('admin.announcementsModule.detail.downloadAttachment')}
                    previewTruncatedLabel={t('admin.announcementsModule.detail.attachmentPreviewTruncated')}
                    previewLoadingLabel={t('admin.announcementsModule.detail.attachmentPreviewLoading')}
                    previewUnavailableLabel={t('admin.announcementsModule.detail.attachmentPreviewUnavailable')}
                    onDownloadClick={handleTrackedClick}
                  />
                ))}
              </div>
            ) : (
              <AnnouncementDetailSectionEmpty
                icon={Paperclip}
                title={t('admin.announcementsModule.detail.noAttachments')}
                subtitle={t('admin.announcementsModule.detail.empty.attachmentsSubtitle')}
              />
            )}
          </section>

          {!isStudent ? (
            <AnnouncementEmailPreview
              announcementId={model.id}
              hasContent={Boolean(
                model.title?.trim()
                || model.summary?.trim()
                || model.body?.trim()
                || model.coverImageUrl
                || model.attachments.length > 0,
              )}
              sectionHeader={
                <DetailSectionHeader
                  icon={Mail}
                  title={t('admin.announcementsModule.detail.emailPreview.title')}
                  accent="#6366f1"
                />
              }
            />
          ) : null}

          {isStudent || urlLinks.length > 0 ? (
            <section className="admin-ann-detail-panel">
              <div className="admin-ann-detail-panel__head">
                <DetailSectionHeader
                  icon={Link2}
                  title={
                    isStudent
                      ? t('student.announcements.detail.urls', { defaultValue: 'Liens utiles' })
                      : t('admin.announcementsModule.detail.relatedLinks')
                  }
                  accent="#6366f1"
                />
                {urlLinks.length > 0 ? (
                  <span className="admin-ann-detail-count">{urlLinks.length}</span>
                ) : null}
              </div>
              {urlLinks.length > 0 ? (
                <ul className="admin-ann-detail-links">
                  {urlLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-ann-detail-link-card"
                        onClick={(event) =>
                          handleTrackedClick(event, {
                            url: link.url,
                            label: link.label,
                            source: 'link',
                          })
                        }
                      >
                        <span className="admin-ann-detail-link-card__icon" aria-hidden>
                          <Link2 className="h-4 w-4" />
                        </span>
                        <span className="admin-ann-detail-link-card__body">
                          <span className="admin-ann-detail-link-card__label">{link.label}</span>
                          <span className="admin-ann-detail-link-card__url">{link.url}</span>
                        </span>
                        <ExternalLink
                          className="admin-ann-detail-link-card__external h-4 w-4 shrink-0"
                          aria-hidden
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <AnnouncementDetailSectionEmpty
                  icon={Link2}
                  title={t('student.announcements.detail.noUrls', { defaultValue: 'Aucun lien' })}
                  subtitle={t('student.announcements.detail.noUrlsSubtitle', {
                    defaultValue: 'Cette annonce ne contient pas de lien externe.',
                  })}
                  accent="#6366f1"
                />
              )}
            </section>
          ) : null}
        </motion.div>

        <motion.aside className="admin-ann-detail-aside" variants={fadeInUp}>
          {isStudent ? (
            <>
              {studentDateRows.length > 0 ? (
                <section className="admin-ann-detail-panel admin-ann-detail-panel--compact">
                  <DetailSectionHeader
                    icon={CalendarCheck}
                    title={t('student.announcements.detail.keyDates', { defaultValue: 'Dates clés' })}
                    accent="#6366f1"
                  />
                  <dl className="admin-ann-detail-meta-list">
                    {studentDateRows.map((row) => (
                      <MetaRow
                        key={row.key}
                        label={row.label}
                        value={row.value}
                        icon={row.icon}
                      />
                    ))}
                  </dl>
                </section>
              ) : null}

              {studentInternshipDetails ? (
                <section className="admin-ann-detail-panel admin-ann-detail-panel--compact">
                  <DetailSectionHeader
                    icon={Building2}
                    title={t('student.announcements.detail.internshipInfo', {
                      defaultValue: 'Informations stage',
                    })}
                    accent="#0891b2"
                  />
                  <dl className="admin-ann-detail-meta-list">
                    {studentInternshipDetails.location ? (
                      <MetaRow
                        key="location"
                        label={t('student.announcements.detail.location', { defaultValue: 'Lieu' })}
                        value={studentInternshipDetails.location}
                        icon={Building2}
                      />
                    ) : null}
                    {studentInternshipDetails.duration ? (
                      <MetaRow
                        key="duration"
                        label={t('student.announcements.detail.duration', { defaultValue: 'Durée' })}
                        value={studentInternshipDetails.duration}
                        icon={Clock3}
                      />
                    ) : null}
                    {studentInternshipDetails.workMode ? (
                      <MetaRow
                        key="workMode"
                        label={t('student.announcements.detail.workMode', { defaultValue: 'Mode de travail' })}
                        value={studentInternshipDetails.workMode}
                        icon={Globe2}
                      />
                    ) : null}
                    {studentInternshipDetails.compensation ? (
                      <MetaRow
                        key="compensation"
                        label={t('student.announcements.detail.compensation', {
                          defaultValue: 'Rémunération',
                        })}
                        value={studentInternshipDetails.compensation}
                        icon={Tag}
                      />
                    ) : null}
                  </dl>
                </section>
              ) : null}
            </>
          ) : (
            <>
          <section className="admin-ann-detail-panel admin-ann-detail-panel--compact admin-ann-detail-panel--stats">
            <DetailSectionHeader
              icon={BarChart3}
              title={t('admin.announcementsModule.detail.performance')}
              accent="#2563eb"
            />
            <div className="admin-ann-detail-performance">
              {performanceStats.map((stat) => (
                <PerformanceStat
                  key={stat.key}
                  statKey={stat.key}
                  label={t(`admin.announcementsModule.detail.performanceStats.${stat.key}`)}
                  value={stat.value}
                />
              ))}
            </div>
          </section>

          <section className="admin-ann-detail-panel admin-ann-detail-panel--compact">
            <DetailSectionHeader
              icon={Info}
              title={t('admin.announcementsModule.detail.info')}
            />
            <dl className="admin-ann-detail-meta-list">
              {infoRows.map((row) => (
                <MetaRow
                  key={row.key}
                  label={row.label}
                  value={row.value}
                  icon={row.icon}
                />
              ))}
            </dl>
          </section>

          <section className="admin-ann-detail-panel admin-ann-detail-panel--compact">
            <DetailSectionHeader
              icon={Radio}
              title={t('admin.announcementsModule.detail.targeting')}
              accent="#0891b2"
            />
            {isAllStudents ? (
              <p className="admin-ann-detail-audience-scope">
                {t('admin.announcementsModule.scopes.ALL_STUDENTS')}
              </p>
            ) : null}
            <AudiencePillGroup
              label={t(`${TARGETING_PREFIX}.program`)}
              items={targeting.programs}
            />
            <AudiencePillGroup
              label={t(`${TARGETING_PREFIX}.level`)}
              items={targeting.levels}
            />
            <AudiencePillGroup
              label={t(`${TARGETING_PREFIX}.class`)}
              items={targeting.classes}
            />
            <AudiencePillGroup
              label={t(`${TARGETING_PREFIX}.internshipType`)}
              items={targeting.internshipTypes}
            />
            {!isAllStudents &&
            targeting.programs.length === 0 &&
            targeting.levels.length === 0 &&
            targeting.classes.length === 0 &&
            targeting.internshipTypes.length === 0 &&
            model.targetAudienceLabel ? (
              <p className="admin-ann-detail-audience-scope">{model.targetAudienceLabel}</p>
            ) : null}
            <p className="admin-ann-detail-eligible">
              <Users className="h-4 w-4 shrink-0" aria-hidden />
              {t('admin.announcementsModule.detail.audience.eligibleStudents', {
                count: model.stats.audienceCount,
              })}
            </p>
          </section>

          <section className="admin-ann-detail-panel admin-ann-detail-panel--compact">
            <DetailSectionHeader
              icon={CalendarCheck}
              title={t('admin.announcementsModule.detail.publication.title')}
              accent="#6366f1"
            />
            <dl className="admin-ann-detail-meta-list">
              {publicationRows.map((row) => (
                <MetaRow
                  key={row.key}
                  label={row.label}
                  value={row.value}
                  icon={row.icon}
                />
              ))}
            </dl>
          </section>

          {model.tags.length > 0 ? (
            <section className="admin-ann-detail-panel admin-ann-detail-panel--compact">
              <DetailSectionHeader
                icon={Tag}
                title={t('admin.announcementsModule.detail.tags')}
              />
              <div className="admin-ann-detail-tags">
                {model.tags.map((tag) => (
                  <span key={tag} className="admin-ann-detail-tag">
                    <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="admin-ann-detail-panel admin-ann-detail-panel--compact">
            <DetailSectionHeader
              icon={History}
              title={t('admin.announcementsModule.detail.timeline')}
              accent="#7c3aed"
            />
            {model.publicationHistory.length > 0 ? (
              <ul className="admin-ann-detail-timeline">
                {model.publicationHistory.map((log, index) => (
                  <li
                    key={`${log.action}-${log.created_at}-${index}`}
                    className="admin-ann-detail-timeline__item"
                  >
                    <span className="admin-ann-detail-timeline__rail" aria-hidden>
                      <span className="admin-ann-detail-timeline__dot" />
                      {index < model.publicationHistory.length - 1 ? (
                        <span className="admin-ann-detail-timeline__line" />
                      ) : null}
                    </span>
                    <div className="admin-ann-detail-timeline__content">
                      <p className="admin-ann-detail-timeline__action">
                        {timelineActionLabel(log.action)}
                      </p>
                      <time dateTime={log.created_at} className="admin-ann-detail-timeline__time">
                        {formatAnnouncementDateShort(log.created_at, locale)}
                      </time>
                      {log.note ? (
                        <p className="admin-ann-detail-timeline__note">{log.note}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <AnnouncementDetailSectionEmpty
                icon={History}
                title={t('admin.announcementsModule.detail.noTimeline')}
                subtitle={t('admin.announcementsModule.detail.empty.timelineSubtitle')}
                accent="#7c3aed"
              />
            )}
          </section>
            </>
          )}
        </motion.aside>
      </div>
    </motion.div>
  );
};

export default AnnouncementDetailView;
