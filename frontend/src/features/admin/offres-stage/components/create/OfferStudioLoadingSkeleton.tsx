import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PREFIX = 'admin.forms.createOfferStudio.loading';
const MESSAGE_KEYS = ['title', 'retrieving', 'preparing'] as const;

const OfferStudioLoadingSkeleton: FunctionComponent = () => {
  const { t } = useTranslation();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % MESSAGE_KEYS.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="offer-studio-loading" aria-busy="true" aria-live="polite">
      <div className="offer-studio-loading__center">
        <div className="offer-studio-loading__pulse" aria-hidden />
        <h2 className="offer-studio-loading__title">{t(`${PREFIX}.${MESSAGE_KEYS[messageIndex]}`)}</h2>
        <p className="offer-studio-loading__subtitle">{t(`${PREFIX}.subtitle`)}</p>
      </div>

      <div className="offer-studio-loading__layout">
        <div className="offer-studio-loading__workspace">
          <div className="admin-shimmer offer-studio-loading__back" />
          <div className="admin-shimmer offer-studio-loading__hero" />
          <div className="admin-shimmer offer-studio-loading__stepper" />
          <div className="offer-studio-loading__panel">
            <div className="admin-shimmer offer-studio-loading__panel-head" />
            <div className="offer-studio-loading__fields">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="admin-shimmer offer-studio-loading__field" />
              ))}
            </div>
          </div>
        </div>
        <div className="offer-studio-loading__preview">
          <div className="admin-shimmer offer-studio-loading__preview-card" />
          <div className="admin-shimmer offer-studio-loading__preview-card offer-studio-loading__preview-card--short" />
        </div>
      </div>
    </div>
  );
};

export default OfferStudioLoadingSkeleton;
