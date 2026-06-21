import { FunctionComponent, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';

import { Building2, Eye, MapPin, Star, Users } from 'lucide-react';

import type { AnalyticsPreview, CreateOfferFormState } from '../../types/createOfferWorkflow';

import CreateOfferInsights from './CreateOfferInsights';

import type { SmartInsight } from '../../types/createOfferWorkflow';
import { SafeBadge, SafeClampText, SafeText } from '../../../../../design-system/safeContent';

const PREFIX = 'admin.forms.createOfferStudio.preview';
const PREVIEW_TAG_LIMIT = 5;



interface CreateOfferPreviewPanelProps {

  form: CreateOfferFormState;

  analytics: AnalyticsPreview;

  insights: SmartInsight[];

  audienceSize: number;

  hasTargeting: boolean;

  canPreviewMatchScore: boolean;

}



function formatMetric(

  value: number | null,

  t: (key: string) => string,

  suffix = '',

): string {

  if (value === null) return t(`${PREFIX}.notAvailable`);

  return `${value}${suffix}`;

}



const CreateOfferPreviewPanel: FunctionComponent<CreateOfferPreviewPanelProps> = ({

  form,

  analytics,

  insights,

  audienceSize,

  hasTargeting,

  canPreviewMatchScore,

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



  const matchLabel = canPreviewMatchScore

    ? t(`${PREFIX}.matchPending`)

    : t(`${PREFIX}.notAvailable`);



  return (

    <aside className="offer-studio-preview" aria-label={t(`${PREFIX}.title`)}>

      <div className="offer-studio-preview__head">

        <Eye className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />

        <div>

          <h2 className="offer-studio-preview__title">{t(`${PREFIX}.title`)}</h2>

          <p className="offer-studio-preview__subtitle">{t(`${PREFIX}.subtitle`)}</p>

        </div>

      </div>



      <motion.div

        className="offer-preview-card"

        key={`${form.title}-${form.company}`}

        initial={{ opacity: 0.9, scale: 0.98 }}

        animate={{ opacity: 1, scale: 1 }}

        transition={{ duration: 0.3 }}

      >

        <h3 className="offer-preview-card__title safe-card-title">
          <SafeText as="span">{form.title || t(`${PREFIX}.placeholderTitle`)}</SafeText>
        </h3>
        <div className="offer-preview-card__meta">
          <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <SafeText className="text-[inherit]">{form.company || t(`${PREFIX}.placeholderCompany`)}</SafeText>
          <span>•</span>
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <SafeText className="text-[inherit]">{form.location || t(`${PREFIX}.placeholderLocation`)}</SafeText>
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

        <div className="offer-preview-card__match">

          <div className="flex items-center gap-1.5">

            <Star className="h-4 w-4 fill-amber-500/40 text-amber-500/60" aria-hidden />

            <span className="text-sm font-medium text-[var(--admin-text-secondary)]">{matchLabel}</span>

          </div>

          <span className="text-xs text-[var(--admin-text-secondary)]">{t(`${PREFIX}.matchLabel`)}</span>

        </div>

      </motion.div>



      <div className="offer-audience-badge">

        <Users className="h-4 w-4" aria-hidden />

        {audienceSize > 0

          ? t(`${PREFIX}.audience`, { count: audienceSize })

          : hasTargeting

            ? t(`${PREFIX}.audiencePending`)

            : t(`${PREFIX}.audienceEmpty`)}

      </div>



      <div className="offer-analytics-grid">

        <div className="offer-analytics-card">

          <span className="offer-analytics-card__label">{t(`${PREFIX}.analytics.reach`)}</span>

          <span className="offer-analytics-card__value">

            {formatMetric(analytics.expectedReach, t)}

          </span>

        </div>

        <div className="offer-analytics-card">

          <span className="offer-analytics-card__label">{t(`${PREFIX}.analytics.completeness`)}</span>

          <span className="offer-analytics-card__value">{analytics.completenessScore}%</span>

        </div>

        <div className="offer-analytics-card">

          <span className="offer-analytics-card__label">{t(`${PREFIX}.analytics.applications`)}</span>

          <span className="offer-analytics-card__value">

            {formatMetric(analytics.predictedApplications, t)}

          </span>

        </div>

        <div className="offer-analytics-card">

          <span className="offer-analytics-card__label">{t(`${PREFIX}.analytics.visibility`)}</span>

          <span className="offer-analytics-card__value">{analytics.visibilityScore}%</span>

        </div>

      </div>



      {insights.length > 0 && <CreateOfferInsights insights={insights} />}

    </aside>

  );

};



export default CreateOfferPreviewPanel;


