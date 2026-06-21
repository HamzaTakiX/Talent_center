import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Star } from 'lucide-react';
import { SafeBadge, SafeClampText, SafeText } from '../../../../../design-system/safeContent';
import type { CreateOfferFormState } from '../../types/createOfferWorkflow';
import { buildOfferTags } from './reviewOfferHelpers';

const STUDIO_PREFIX = 'admin.forms.createOfferStudio';
const PREFIX = `${STUDIO_PREFIX}.review`;

interface ReviewStudentPreviewCardProps {
  form: CreateOfferFormState;
  descriptionPreview: string;
}

const ReviewStudentPreviewCard: FunctionComponent<ReviewStudentPreviewCardProps> = ({
  form,
  descriptionPreview,
}) => {
  const { t } = useTranslation();
  const workModeLabel = form.workMode
    ? t(`${STUDIO_PREFIX}.workModes.${form.workMode}`)
    : '';
  const tags = buildOfferTags(form, workModeLabel);
  const visibleTags = tags.slice(0, 5);
  const overflowCount = tags.length > 5 ? tags.length - 5 : 0;

  return (
    <article className="offer-review-student-card">
      <div className="offer-review-student-card__header">
        <div className="offer-review-student-card__main">
          <SafeClampText lines={2} className="offer-review-student-card__title">
            {form.title.trim() || t(`${STUDIO_PREFIX}.preview.placeholderTitle`)}
          </SafeClampText>
          <div className="offer-review-student-card__meta">
            <Building2 className="h-4 w-4 shrink-0" aria-hidden />
            <span className="offer-review-student-card__meta-text">
              <SafeText>{form.company.trim() || t(`${STUDIO_PREFIX}.preview.placeholderCompany`)}</SafeText>
            </span>
            <span className="offer-review-student-card__meta-sep" aria-hidden>
              •
            </span>
            <span className="offer-review-student-card__meta-text">
              <SafeText>{form.location.trim() || t(`${STUDIO_PREFIX}.preview.placeholderLocation`)}</SafeText>
            </span>
          </div>
          {visibleTags.length > 0 && (
            <div className="offer-review-student-card__tags">
              {visibleTags.map((tag) => (
                <SafeBadge key={tag} className="admin-badge admin-badge--info">
                  {tag}
                </SafeBadge>
              ))}
              {overflowCount > 0 && (
                <SafeBadge className="admin-badge admin-badge--neutral">
                  {t(`${STUDIO_PREFIX}.preview.moreBadges`, { count: overflowCount })}
                </SafeBadge>
              )}
            </div>
          )}
        </div>
        <div className="offer-review-student-card__match">
          <div className="offer-review-student-card__match-value">
            <Star className="offer-review-student-card__match-star h-4 w-4" aria-hidden />
            <span>—</span>
          </div>
          <span className="offer-review-student-card__match-label">
            {t(`${STUDIO_PREFIX}.preview.matchLabel`)}
          </span>
        </div>
      </div>
      <SafeClampText lines={3} className="offer-review-student-card__desc">
        {descriptionPreview}
      </SafeClampText>
      <p className="offer-review-student-card__hint">{t(`${PREFIX}.studentPreview.hint`)}</p>
    </article>
  );
};

export default ReviewStudentPreviewCard;
