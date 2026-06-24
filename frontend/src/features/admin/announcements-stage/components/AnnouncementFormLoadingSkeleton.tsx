import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone } from 'lucide-react';

const P = 'admin.announcementsModule.formLoading';
const MESSAGE_KEYS = ['loading', 'preparing', 'almost'] as const;

const AnnouncementFormLoadingSkeleton: FunctionComponent = () => {
  const { t } = useTranslation();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % MESSAGE_KEYS.length);
    }, 1600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="admin-ann-form-loading" aria-busy="true" aria-live="polite">
      <div className="admin-ann-form-loading__hero">
        <span className="admin-ann-form-loading__icon" aria-hidden>
          <Megaphone className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="admin-ann-form-loading__title">{t(`${P}.${MESSAGE_KEYS[messageIndex]}`)}</p>
          <p className="admin-ann-form-loading__subtitle">{t(`${P}.subtitle`)}</p>
        </div>
      </div>

      <div className="admin-ann-form-loading__panel">
        <div className="admin-shimmer admin-ann-form-loading__section-title" />
        <div className="admin-ann-form-loading__grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="admin-shimmer admin-ann-form-loading__field" />
          ))}
        </div>
        <div className="admin-shimmer admin-ann-form-loading__cover" />
        <div className="admin-shimmer admin-ann-form-loading__textarea" />
      </div>
    </div>
  );
};

export default AnnouncementFormLoadingSkeleton;
