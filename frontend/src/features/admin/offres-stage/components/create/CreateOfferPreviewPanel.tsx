import { CSSProperties, FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  ExternalLink,
  Eye,
  Gauge,
  MapPin,
  Percent,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type {
  AnalyticsPreview,
  CreateOfferFormState,
  DuplicateOffer,
  SmartInsight,
} from '../../types/createOfferWorkflow';
import CreateOfferInsights from './CreateOfferInsights';
import { SafeBadge, SafeClampText, SafeText } from '../../../../../design-system/safeContent';
import OfferCompanyLogo from '../OfferCompanyLogo';

const PREFIX = 'admin.forms.createOfferStudio.preview';
const DUP_PREFIX = 'admin.forms.createOfferStudio.duplicate';
const PREVIEW_TAG_LIMIT = 5;

interface CreateOfferPreviewPanelProps {
  form: CreateOfferFormState;
  analytics: AnalyticsPreview;
  insights: SmartInsight[];
  audienceSize: number;
  hasTargeting: boolean;
  companyLogoUrl?: string | null;
  duplicate?: DuplicateOffer | null;
  onViewDuplicate?: () => void;
  onDismissDuplicate?: () => void;
}

function formatMetric(value: number | null, t: (key: string) => string, suffix = ''): string {
  if (value === null) return '—';
  return `${value}${suffix}`;
}

interface AnalyticsMetric {
  key: string;
  labelKey: string;
  value: string;
  badge: string;
  Icon: LucideIcon;
  accent: string;
  accentBg: string;
  piePercent?: number;
}

const CreateOfferPreviewPanel: FunctionComponent<CreateOfferPreviewPanelProps> = ({
  form,
  analytics,
  insights,
  audienceSize,
  hasTargeting,
  companyLogoUrl,
  duplicate = null,
  onViewDuplicate,
  onDismissDuplicate,
}) => {
  const { t } = useTranslation();

  const tags = useMemo(() => {
    const result: string[] = [];
    if (form.internshipType) result.push(form.internshipType.toUpperCase());
    if (form.workMode && (form.title.trim() || form.company.trim())) {
      result.push(t(`${PREFIX}.workModes.${form.workMode}`));
    }
    form.requiredSkills.forEach((s) => result.push(s));
    form.targeting.categories.forEach((c) => result.push(c));
    return result;
  }, [form, t]);

  const visibleTags =
    tags.length > PREVIEW_TAG_LIMIT ? tags.slice(0, PREVIEW_TAG_LIMIT - 1) : tags;
  const overflowCount =
    tags.length > PREVIEW_TAG_LIMIT ? tags.length - (PREVIEW_TAG_LIMIT - 1) : 0;

  const descriptionPreview =
    form.description.overview ||
    form.description.responsibilities ||
    t(`${PREFIX}.placeholderDesc`);

  const metrics: AnalyticsMetric[] = [
    {
      key: 'reach',
      labelKey: `${PREFIX}.analytics.reach`,
      value: formatMetric(analytics.expectedReach, t),
      badge:
        analytics.expectedReach == null
          ? t(`${PREFIX}.analytics.pendingBadge`, { defaultValue: 'En attente' })
          : t(`${PREFIX}.analytics.reachBadge`, { defaultValue: 'Audience estimée' }),
      Icon: Target,
      accent: '#3b82f6',
      accentBg: 'rgba(59, 130, 246, 0.16)',
      piePercent: 0,
    },
    {
      key: 'completeness',
      labelKey: `${PREFIX}.analytics.completeness`,
      value: `${analytics.completenessScore}%`,
      badge: t(`${PREFIX}.analytics.completenessBadge`, { defaultValue: 'Progression' }),
      Icon: Gauge,
      accent: '#22c55e',
      accentBg: 'rgba(34, 197, 94, 0.16)',
      piePercent: Math.min(100, Math.max(0, Math.round(analytics.completenessScore))),
    },
    {
      key: 'applications',
      labelKey: `${PREFIX}.analytics.applications`,
      value: formatMetric(analytics.predictedApplications, t),
      badge:
        analytics.predictedApplications == null
          ? t(`${PREFIX}.analytics.pendingBadge`, { defaultValue: 'En attente' })
          : t(`${PREFIX}.analytics.applicationsBadge`, { defaultValue: 'Prévision' }),
      Icon: Users,
      accent: '#a855f7',
      accentBg: 'rgba(168, 85, 247, 0.16)',
      piePercent: 0,
    },
    {
      key: 'visibility',
      labelKey: `${PREFIX}.analytics.visibility`,
      value: `${analytics.visibilityScore}%`,
      badge: t(`${PREFIX}.analytics.visibilityBadge`, { defaultValue: 'Exposition' }),
      Icon: Percent,
      accent: '#06b6d4',
      accentBg: 'rgba(6, 182, 212, 0.16)',
      piePercent: Math.min(100, Math.max(0, Math.round(analytics.visibilityScore))),
    },
  ];

  const similarity = duplicate
    ? Math.min(100, Math.max(0, duplicate.similarity))
    : 0;

  const publishedAgoLabel = useMemo(() => {
    if (!duplicate) return '';

    const formatRelative = (ms: number) => {
      const totalSeconds = Math.max(0, Math.floor(ms / 1000));
      if (totalSeconds < 60) {
        return t(`${DUP_PREFIX}.publishedAgoSeconds`, {
          count: totalSeconds,
          defaultValue: totalSeconds <= 1 ? 'Publiée à l’instant' : `Publiée il y a ${totalSeconds} s`,
        });
      }
      const totalMinutes = Math.floor(totalSeconds / 60);
      if (totalMinutes < 60) {
        return t(`${DUP_PREFIX}.publishedAgoMinutes`, {
          count: totalMinutes,
          defaultValue: `Publiée il y a ${totalMinutes} min`,
        });
      }
      const totalHours = Math.floor(totalMinutes / 60);
      if (totalHours < 24) {
        return t(`${DUP_PREFIX}.publishedAgoHours`, {
          count: totalHours,
          defaultValue: `Publiée il y a ${totalHours} h`,
        });
      }
      const days = Math.floor(totalHours / 24);
      return t(`${DUP_PREFIX}.publishedAgo`, {
        days,
        defaultValue: days === 1 ? 'Publiée il y a 1 jour' : `Publiée il y a ${days} jours`,
      });
    };

    if (duplicate.publishedAt) {
      const publishedMs = Date.parse(duplicate.publishedAt);
      if (!Number.isNaN(publishedMs)) {
        return formatRelative(Date.now() - publishedMs);
      }
    }

    if (duplicate.publishedDaysAgo <= 0) {
      return t(`${DUP_PREFIX}.publishedAgoSeconds`, {
        count: 0,
        defaultValue: 'Publiée à l’instant',
      });
    }

    return t(`${DUP_PREFIX}.publishedAgo`, {
      days: duplicate.publishedDaysAgo,
      defaultValue:
        duplicate.publishedDaysAgo === 1
          ? 'Publiée il y a 1 jour'
          : `Publiée il y a ${duplicate.publishedDaysAgo} jours`,
    });
  }, [duplicate, t]);

  return (
    <aside className="offer-studio-preview" aria-label={t(`${PREFIX}.title`)}>
      <div className="offer-studio-preview__head">
        <span className="offer-studio-preview__head-icon" aria-hidden>
          <Eye className="h-4 w-4" strokeWidth={1.85} />
        </span>
        <div className="min-w-0">
          <h2 className="offer-studio-preview__title">{t(`${PREFIX}.title`)}</h2>
          <p className="offer-studio-preview__subtitle">{t(`${PREFIX}.subtitle`)}</p>
        </div>
      </div>

      <div className="offer-studio-preview__stage">
        <div className="offer-studio-preview__main">
          <motion.div
            className="offer-preview-card"
            key={`${form.title}-${form.company}-${companyLogoUrl ?? ''}`}
            initial={{ opacity: 0.9, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="offer-preview-card__header-row">
              <div className="offer-preview-card__avatar">
                <OfferCompanyLogo url={companyLogoUrl} companyName={form.company} size="card" />
              </div>
              <div className="offer-preview-card__heading min-w-0">
                <h3 className="offer-preview-card__title safe-card-title">
                  <SafeText as="span">{form.title || t(`${PREFIX}.placeholderTitle`)}</SafeText>
                </h3>
                <div className="offer-preview-card__meta">
                  <div className="offer-preview-card__meta-row">
                    <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <SafeText className="text-[inherit]">
                      {form.company || t(`${PREFIX}.placeholderCompany`)}
                    </SafeText>
                  </div>
                  <div className="offer-preview-card__meta-row">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <SafeText className="text-[inherit]">
                      {form.location || t(`${PREFIX}.placeholderLocation`)}
                    </SafeText>
                  </div>
                </div>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="offer-preview-card__tags">
                {visibleTags.map((tag, index) => (
                  <SafeBadge
                    key={`${tag}-${index}`}
                    className="admin-badge admin-badge--info text-[0.68rem]"
                  >
                    {tag}
                  </SafeBadge>
                ))}
                {overflowCount > 0 && (
                  <SafeBadge
                    className="admin-badge admin-badge--neutral offer-preview-card__tags-more text-[0.68rem]"
                    title={tags.slice(PREVIEW_TAG_LIMIT - 1).join(', ')}
                  >
                    {t(`${PREFIX}.moreBadges`, { count: overflowCount })}
                  </SafeBadge>
                )}
              </div>
            )}

            <SafeClampText lines={4} className="offer-preview-card__desc">
              {descriptionPreview}
            </SafeClampText>
          </motion.div>

          <div className="offer-audience-badge">
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              {audienceSize > 0
                ? t(`${PREFIX}.audience`, { count: audienceSize })
                : hasTargeting
                  ? t(`${PREFIX}.audiencePending`)
                  : t(`${PREFIX}.audienceEmpty`)}
            </span>
          </div>
        </div>

        <div className="offer-studio-preview__analytics-col">
          <div
            className="offer-analytics-grid"
            aria-label={t(`${PREFIX}.analytics.title`, { defaultValue: 'Analytics' })}
          >
            {metrics.map(({ key, labelKey, value, badge, Icon, accent, accentBg, piePercent }) => (
              <article
                key={key}
                className={[
                  'admin-students-stat-card',
                  'offer-analytics-stat-card',
                  piePercent != null ? 'admin-students-stat-card--rate' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  {
                    '--student-stat-accent': accent,
                    '--student-stat-accent-bg': accentBg,
                  } as CSSProperties
                }
              >
                <div className="admin-students-stat-card__body">
                  <div className="admin-students-stat-card__head">
                    <span className="admin-students-stat-card__icon" aria-hidden>
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </span>
                    <p className="admin-students-stat-card__title">{t(labelKey)}</p>
                  </div>
                  <p className="admin-students-stat-card__value">{value}</p>
                  <span className="admin-students-stat-card__badge">{badge}</span>
                </div>
                {piePercent != null ? (
                  <div
                    className="admin-students-stat-card__pie"
                    style={{ '--student-stat-pie': piePercent } as CSSProperties}
                    role="img"
                    aria-label={`${t(labelKey)} ${piePercent}%`}
                  >
                    <span className="admin-students-stat-card__pie-inner">{piePercent}%</span>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          {duplicate ? (
            <div className="offer-preview-duplicate-alert" role="alert">
              <div className="offer-preview-duplicate-alert__head">
                <span className="offer-preview-duplicate-alert__icon" aria-hidden>
                  <AlertTriangle className="h-4 w-4" strokeWidth={2} />
                </span>
                <p className="offer-preview-duplicate-alert__title">
                  {t(`${DUP_PREFIX}.detected`, { defaultValue: 'Doublon potentiel détecté' })}
                </p>
              </div>
              <p className="offer-preview-duplicate-alert__desc">
                <strong>{duplicate.title}</strong>
                {duplicate.company ? <> — {duplicate.company}</> : null}
              </p>
              <div className="offer-preview-duplicate-alert__meta">
                <span className="offer-preview-duplicate-alert__badge offer-preview-duplicate-alert__badge--similarity">
                  {t(`${DUP_PREFIX}.similarity`, {
                    percent: similarity,
                    defaultValue: `${similarity} % de similarité`,
                  })}
                </span>
                <span className="offer-preview-duplicate-alert__badge offer-preview-duplicate-alert__badge--time">
                  {publishedAgoLabel}
                </span>
              </div>
              <div className="offer-preview-duplicate-alert__actions">
                {onViewDuplicate ? (
                  <button
                    type="button"
                    className="offer-preview-duplicate-alert__btn offer-preview-duplicate-alert__btn--ghost"
                    onClick={onViewDuplicate}
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    {t(`${DUP_PREFIX}.viewExisting`, { defaultValue: "Voir l'offre existante" })}
                  </button>
                ) : null}
                {onDismissDuplicate ? (
                  <button
                    type="button"
                    className="offer-preview-duplicate-alert__btn offer-preview-duplicate-alert__btn--ghost"
                    onClick={onDismissDuplicate}
                  >
                    {t(`${DUP_PREFIX}.continueAnyway`, { defaultValue: 'Continuer quand même' })}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {insights.length > 0 && <CreateOfferInsights insights={insights} />}
    </aside>
  );
};

export default CreateOfferPreviewPanel;
