import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import type { DuplicateOffer } from '../../types/createOfferWorkflow';

const PREFIX = 'admin.forms.createOfferStudio.duplicate';

interface DuplicateDetectionBannerProps {
  duplicate: DuplicateOffer;
  onViewExisting: () => void;
  onContinue: () => void;
}

const DuplicateDetectionBanner: FunctionComponent<DuplicateDetectionBannerProps> = ({
  duplicate,
  onViewExisting,
  onContinue,
}) => {
  const { t } = useTranslation();
  const similarity = Math.min(100, Math.max(0, duplicate.similarity));

  return (
    <div className="offer-duplicate-banner" role="alert">
      <div className="offer-duplicate-banner__content">
        <div className="offer-duplicate-banner__icon-wrap" aria-hidden>
          <AlertTriangle className="offer-duplicate-banner__icon" />
        </div>
        <div className="offer-duplicate-banner__body">
          <p className="offer-duplicate-banner__title">{t(`${PREFIX}.detected`)}</p>
          <p className="offer-duplicate-banner__desc">
            <strong>{duplicate.title}</strong>
            {duplicate.company ? (
              <>
                {' — '}
                {duplicate.company}
              </>
            ) : null}
          </p>
          <div className="offer-duplicate-banner__meta">
            <span className="offer-duplicate-banner__badge">
              {t(`${PREFIX}.similarity`, { percent: similarity })}
            </span>
            <span className="offer-duplicate-banner__badge offer-duplicate-banner__badge--muted">
              {t(`${PREFIX}.publishedAgo`, { days: duplicate.publishedDaysAgo })}
            </span>
          </div>
          <div
            className="offer-duplicate-banner__progress"
            role="progressbar"
            aria-valuenow={similarity}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t(`${PREFIX}.similarity`, { percent: similarity })}
          >
            <div
              className="offer-duplicate-banner__progress-fill"
              style={{ width: `${similarity}%` }}
            />
          </div>
        </div>
      </div>
      <div className="offer-duplicate-banner__actions">
        <button
          type="button"
          className="offer-duplicate-banner__btn offer-duplicate-banner__btn--primary"
          onClick={onViewExisting}
        >
          <ExternalLink className="offer-duplicate-banner__btn-icon" aria-hidden />
          {t(`${PREFIX}.viewExisting`)}
        </button>
        <button
          type="button"
          className="offer-duplicate-banner__btn offer-duplicate-banner__btn--ghost"
          onClick={onContinue}
        >
          {t(`${PREFIX}.continueAnyway`)}
        </button>
      </div>
    </div>
  );
};

export default DuplicateDetectionBanner;
