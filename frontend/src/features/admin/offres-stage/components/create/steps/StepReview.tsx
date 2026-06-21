import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Eye,
  Globe,
  MapPin,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../../../auth/hooks/useAuth';
import { getAdminDisplayName } from '../../../../dashboard/utils/adminUserDisplay';
import { SafeBadge, SafeClampText, SafeText } from '../../../../../../design-system/safeContent';
import type { AnalyticsPreview, CreateOfferFormState, WizardStep } from '../../../types/createOfferWorkflow';
import ReviewStudentPreviewCard from '../ReviewStudentPreviewCard';
import OfferValidationCenter from '../OfferValidationCenter';
import {
  buildOfferTags,
  computeInternshipDuration,
  computeReadinessScore,
  displayExpectedReach,
  formatReviewDate,
  isReadyToPublish,
} from '../reviewOfferHelpers';

const STUDIO_PREFIX = 'admin.forms.createOfferStudio';
const PREFIX = `${STUDIO_PREFIX}.review`;

interface StepReviewProps {
  form: CreateOfferFormState;
  analytics: AnalyticsPreview;
  hasTargeting: boolean;
  onNavigateToStep: (step: WizardStep) => void;
  editMeta?: {
    status: string;
    lastUpdatedAt: string | null;
  };
}

const StepReview: FunctionComponent<StepReviewProps> = ({
  form,
  analytics,
  hasTargeting,
  onNavigateToStep,
  editMeta,
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const locale = i18n.language || 'fr';

  const readinessScore = useMemo(() => computeReadinessScore(form), [form]);
  const ready = useMemo(() => isReadyToPublish(form), [form]);

  const workModeLabel = form.workMode ? t(`${STUDIO_PREFIX}.workModes.${form.workMode}`) : '';
  const typeLabel = form.internshipType
    ? t(`${STUDIO_PREFIX}.types.${form.internshipType}`)
    : t(`${PREFIX}.notSet`);
  const duration = computeInternshipDuration(
    form.recruitment.startDate,
    form.recruitment.endDate,
    t,
  );
  const tags = buildOfferTags(form, workModeLabel);
  const descriptionPreview =
    form.description.overview ||
    form.description.responsibilities ||
    t(`${STUDIO_PREFIX}.preview.placeholderDesc`);
  const publishedBy = getAdminDisplayName(user) || t(`${PREFIX}.publication.defaultAuthor`);
  const notSet = t(`${PREFIX}.notSet`);
  const emptyConfiguredLabel = t(`${PREFIX}.emptyState.notConfigured`);

  const resolveRecruitmentValue = (raw: string, isEmpty: boolean) =>
    isEmpty ? emptyConfiguredLabel : raw;

  const targetingItems = [
    { label: t(`${STUDIO_PREFIX}.targeting.program`), values: form.targeting.programs },
    { label: t(`${STUDIO_PREFIX}.targeting.level`), values: form.targeting.levels },
    { label: t(`${STUDIO_PREFIX}.targeting.class`), values: form.targeting.classes },
    { label: t(`${STUDIO_PREFIX}.targeting.department`), values: form.targeting.departments },
    { label: t(`${STUDIO_PREFIX}.targeting.category`), values: form.targeting.categories },
  ].filter((item) => item.values.length > 0);

  const recruitmentItems = [
    {
      icon: Users,
      label: t(`${PREFIX}.recruitment.positions`),
      value: String(form.positions),
      empty: false,
      warn: false,
    },
    {
      icon: Calendar,
      label: t(`${STUDIO_PREFIX}.recruitment.deadline`),
      value: resolveRecruitmentValue(
        formatReviewDate(form.recruitment.applicationDeadline, locale, emptyConfiguredLabel),
        !form.recruitment.applicationDeadline,
      ),
      empty: !form.recruitment.applicationDeadline,
      warn: !form.recruitment.applicationDeadline,
    },
    {
      icon: Clock,
      label: t(`${STUDIO_PREFIX}.recruitment.startDate`),
      value: resolveRecruitmentValue(
        formatReviewDate(form.recruitment.startDate, locale, emptyConfiguredLabel),
        !form.recruitment.startDate,
      ),
      empty: !form.recruitment.startDate,
      warn: false,
    },
    {
      icon: Clock,
      label: t(`${STUDIO_PREFIX}.recruitment.endDate`),
      value: resolveRecruitmentValue(
        formatReviewDate(form.recruitment.endDate, locale, emptyConfiguredLabel),
        !form.recruitment.endDate,
      ),
      empty: !form.recruitment.endDate,
      warn: false,
    },
    {
      icon: Target,
      label: t(`${PREFIX}.fields.type`),
      value: resolveRecruitmentValue(typeLabel, !form.internshipType),
      empty: !form.internshipType,
      warn: false,
    },
    {
      icon: Globe,
      label: t(`${STUDIO_PREFIX}.fields.workMode`),
      value: resolveRecruitmentValue(workModeLabel, !form.workMode),
      empty: !form.workMode,
      warn: false,
    },
    {
      icon: MapPin,
      label: t(`${STUDIO_PREFIX}.fields.location`),
      value: resolveRecruitmentValue(form.location.trim(), !form.location.trim()),
      empty: !form.location.trim(),
      warn: false,
    },
  ];

  const publicationItems = [
    {
      label: t(`${STUDIO_PREFIX}.recruitment.visibility`),
      value: t(`${STUDIO_PREFIX}.recruitment.visibilityOptions.${form.recruitment.visibility}`),
    },
    {
      label: t(`${PREFIX}.publication.status`),
      value: editMeta?.status ?? t(`${PREFIX}.publication.draft`),
    },
    { label: t(`${PREFIX}.publication.publishMode`), value: t(`${PREFIX}.publication.immediate`) },
    { label: t(`${PREFIX}.publication.createdBy`), value: publishedBy },
    {
      label: t(`${PREFIX}.publication.lastUpdated`),
      value: editMeta?.lastUpdatedAt
        ? formatReviewDate(editMeta.lastUpdatedAt, locale, notSet)
        : t(`${PREFIX}.publication.notYetSaved`),
    },
  ];

  return (
    <div className="offer-review-page">
      {/* Readiness banner */}
      <section
        className={`offer-review-banner ${ready ? 'offer-review-banner--ready' : 'offer-review-banner--attention'}`}
        aria-live="polite"
      >
        <div className="offer-review-banner__content">
          <div className="offer-review-banner__icon-wrap">
            {ready ? (
              <ShieldCheck className="h-6 w-6" aria-hidden />
            ) : (
              <AlertTriangle className="h-6 w-6" aria-hidden />
            )}
          </div>
          <div>
            <h3 className="offer-review-banner__title">
              {ready ? t(`${PREFIX}.banner.readyTitle`) : t(`${PREFIX}.banner.attentionTitle`)}
            </h3>
            <p className="offer-review-banner__desc">
              {ready ? t(`${PREFIX}.banner.readyDesc`) : t(`${PREFIX}.banner.attentionDesc`)}
            </p>
          </div>
        </div>
        <div className="offer-review-banner__score">
          <span className="offer-review-banner__score-label">{t(`${PREFIX}.banner.readinessScore`)}</span>
          <span className="offer-review-banner__score-value">{readinessScore}%</span>
          <div
            className="offer-review-banner__progress"
            role="progressbar"
            aria-valuenow={readinessScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t(`${PREFIX}.banner.readinessScore`)}
          >
            <div
              className="offer-review-banner__progress-fill"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
        </div>
      </section>

      {/* Offer preview hero card */}
      <section className="offer-review-hero-card">
        <div className="offer-review-hero-card__head">
          <span className="offer-review-section-label">{t(`${PREFIX}.offerPreview.title`)}</span>
          <SafeBadge className={`admin-badge ${ready ? 'admin-badge--success' : 'admin-badge--warning'}`}>
            {ready ? t(`${PREFIX}.offerPreview.readyBadge`) : t(`${PREFIX}.offerPreview.draftBadge`)}
          </SafeBadge>
        </div>
        <h3 className="offer-review-hero-card__title">
          <SafeText as="span">{form.title.trim() || t(`${STUDIO_PREFIX}.preview.placeholderTitle`)}</SafeText>
        </h3>
        <div className="offer-review-hero-card__company">
          <Building2 className="h-4 w-4 shrink-0" aria-hidden />
          <SafeText>{form.company.trim() || t(`${STUDIO_PREFIX}.preview.placeholderCompany`)}</SafeText>
        </div>
        <div className="offer-review-hero-card__grid">
          <div className="offer-review-meta-item">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            <span className="offer-review-meta-item__label">{t(`${STUDIO_PREFIX}.fields.location`)}</span>
            <span className="offer-review-meta-item__value">
              {form.location.trim() || notSet}
            </span>
          </div>
          <div className="offer-review-meta-item">
            <Target className="h-3.5 w-3.5" aria-hidden />
            <span className="offer-review-meta-item__label">{t(`${STUDIO_PREFIX}.fields.internshipType`)}</span>
            <span className="offer-review-meta-item__value">{typeLabel}</span>
          </div>
          <div className="offer-review-meta-item">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <span className="offer-review-meta-item__label">{t(`${PREFIX}.offerPreview.duration`)}</span>
            <span className="offer-review-meta-item__value">{duration || notSet}</span>
          </div>
          <div className="offer-review-meta-item">
            <Globe className="h-3.5 w-3.5" aria-hidden />
            <span className="offer-review-meta-item__label">{t(`${STUDIO_PREFIX}.fields.workMode`)}</span>
            <span className="offer-review-meta-item__value">{workModeLabel || notSet}</span>
          </div>
          <div className="offer-review-meta-item">
            <Users className="h-3.5 w-3.5" aria-hidden />
            <span className="offer-review-meta-item__label">{t(`${PREFIX}.publication.publishedBy`)}</span>
            <span className="offer-review-meta-item__value">{publishedBy}</span>
          </div>
          <div className="offer-review-meta-item">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            <span className="offer-review-meta-item__label">{t(`${STUDIO_PREFIX}.recruitment.deadline`)}</span>
            <span
              className={`offer-review-meta-item__value ${!form.recruitment.applicationDeadline ? 'offer-review-meta-item__value--warn' : ''}`}
            >
              {formatReviewDate(form.recruitment.applicationDeadline, locale, notSet)}
            </span>
          </div>
        </div>
        {(form.requiredSkills.length > 0 || form.preferredSkills.length > 0) && (
          <div className="offer-review-hero-card__skills">
            <span className="offer-review-meta-item__label">{t(`${PREFIX}.offerPreview.requiredSkills`)}</span>
            <div className="offer-review-badge-row">
              {form.requiredSkills.map((skill) => (
                <SafeBadge key={skill} className="admin-badge admin-badge--info">
                  {skill}
                </SafeBadge>
              ))}
              {form.preferredSkills.map((skill) => (
                <SafeBadge key={`pref-${skill}`} className="admin-badge admin-badge--info">
                  {skill}
                </SafeBadge>
              ))}
            </div>
          </div>
        )}
        <SafeClampText lines={4} className="offer-review-hero-card__desc">
          {descriptionPreview}
        </SafeClampText>
        {tags.length > 0 && (
          <div className="offer-review-badge-row">
            {tags.map((tag) => (
              <SafeBadge key={tag} className="admin-badge admin-badge--info">
                {tag}
              </SafeBadge>
            ))}
          </div>
        )}
      </section>

      <OfferValidationCenter form={form} onNavigateToStep={onNavigateToStep} />

      {/* Target audience */}
      <section className="offer-review-panel">
        <div className="offer-review-panel__head">
          <h4 className="offer-review-panel__title">{t(`${PREFIX}.audience.title`)}</h4>
          {hasTargeting && (
            <SafeBadge className="admin-badge admin-badge--info">
              {t(`${PREFIX}.audience.targeted`)}
            </SafeBadge>
          )}
        </div>
        {targetingItems.length > 0 ? (
          <div className="offer-review-audience-grid">
            {targetingItems.map((item) => (
              <div key={item.label} className="offer-review-audience-group">
                <span className="offer-review-audience-group__label">{item.label}</span>
                <div className="offer-review-badge-row">
                  {item.values.map((value) => (
                    <SafeBadge key={value} className="admin-badge admin-badge--info">
                      {value}
                    </SafeBadge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="offer-review-empty-hint">{t(`${STUDIO_PREFIX}.targeting.audienceEmpty`)}</p>
        )}
        <p className="offer-review-audience-reach">
          <Users className="h-4 w-4 shrink-0" aria-hidden />
          {t(`${PREFIX}.audience.expectedReach`)}:{' '}
          <strong>{displayExpectedReach(analytics, hasTargeting, t)}</strong>
        </p>
      </section>

      {/* Skills section */}
      <section className="offer-review-panel">
        <h4 className="offer-review-panel__title">{t(`${PREFIX}.skillsSection.title`)}</h4>
        {form.requiredSkills.length > 0 || form.preferredSkills.length > 0 ? (
          <div className="offer-review-skills-grid">
            {form.requiredSkills.length > 0 && (
              <div className="offer-review-skills-group">
                <span className="offer-review-skills-group__label">
                  {t(`${STUDIO_PREFIX}.skills.required`)}
                </span>
                <div className="offer-review-badge-row">
                  {form.requiredSkills.map((skill) => (
                    <SafeBadge key={skill} className="admin-badge admin-badge--info">
                      {skill}
                    </SafeBadge>
                  ))}
                </div>
              </div>
            )}
            {form.preferredSkills.length > 0 && (
              <div className="offer-review-skills-group">
                <span className="offer-review-skills-group__label">
                  {t(`${STUDIO_PREFIX}.skills.preferred`)}
                </span>
                <div className="offer-review-badge-row">
                  {form.preferredSkills.map((skill) => (
                    <SafeBadge key={skill} className="admin-badge admin-badge--info">
                      {skill}
                    </SafeBadge>
                  ))}
                </div>
              </div>
            )}
            {(form.languages.length > 0 || form.softSkills.length > 0) && (
              <div className="offer-review-skills-group">
                <span className="offer-review-skills-group__label">
                  {t(`${PREFIX}.skillsSection.additional`)}
                </span>
                <div className="offer-review-badge-row">
                  {[...form.languages, ...form.softSkills].map((item) => (
                    <SafeBadge key={item} className="admin-badge admin-badge--info">
                      {item}
                    </SafeBadge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="offer-review-empty-hint">{t(`${PREFIX}.skillsSection.empty`)}</p>
        )}
      </section>

      <div className="offer-review-columns">
        {/* Recruitment summary */}
        <section className="offer-review-panel offer-review-panel--recruitment">
          <h4 className="offer-review-panel__title">{t(`${PREFIX}.recruitment.title`)}</h4>
          <div className="offer-review-recruitment-grid">
            {recruitmentItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`offer-review-recruitment-item ${item.warn ? 'offer-review-recruitment-item--warn' : ''}`}
                >
                  <Icon className="offer-review-recruitment-item__icon" aria-hidden />
                  <div className="offer-review-recruitment-item__content">
                    <span className="offer-review-recruitment-item__label">{item.label}</span>
                    <span
                      className={`offer-review-recruitment-item__value ${item.empty ? 'offer-review-recruitment-item__value--empty' : ''}`}
                      title={!item.empty && item.value.length > 24 ? item.value : undefined}
                    >
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Publication settings */}
        <section className="offer-review-panel">
          <h4 className="offer-review-panel__title">{t(`${PREFIX}.publication.title`)}</h4>
          <dl className="offer-review-publication-list">
            {publicationItems.map((item) => (
              <div key={item.label} className="offer-review-publication-row">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Student preview */}
      <section className="offer-review-panel offer-review-panel--highlight">
        <div className="offer-review-panel__head">
          <Eye className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
          <div>
            <h4 className="offer-review-panel__title">{t(`${PREFIX}.studentPreview.title`)}</h4>
            <p className="offer-review-panel__subtitle">{t(`${PREFIX}.studentPreview.subtitle`)}</p>
          </div>
        </div>
        <ReviewStudentPreviewCard form={form} descriptionPreview={descriptionPreview} />
      </section>
    </div>
  );
};

export default StepReview;
