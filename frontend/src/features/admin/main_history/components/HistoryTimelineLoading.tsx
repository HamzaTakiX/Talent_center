import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import HistoryFilterRefreshBar from './HistoryFilterRefreshBar';

interface HistoryTimelineLoadingProps {
  rows?: number;
}

const HistoryTimelineLoading: FunctionComponent<HistoryTimelineLoadingProps> = ({ rows = 3 }) => {
  const { t } = useTranslation();
  const label = t('admin.localHistory.loadingTimeline');

  return (
    <div className="admin-history-timeline-loading" aria-busy="true" aria-live="polite">
      <HistoryFilterRefreshBar active label={label} />

      <div className="admin-history-page__timeline relative min-w-0 max-w-full space-y-3">
        <div className="admin-timeline-rail absolute bottom-0 left-[27px] top-2 w-0.5" aria-hidden />

        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="admin-history-row admin-history-row--skeleton relative flex min-w-0 items-start gap-0"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div className="admin-history-row__icon-col relative z-[1] flex w-14 shrink-0 justify-center pt-1">
              <span className="admin-history-skeleton-circle" aria-hidden />
            </div>

            <div className="admin-history-row__body min-w-0 flex-1 pl-3 sm:pl-4">
              <div className="admin-history-skeleton-card" aria-hidden>
                <div className="admin-history-skeleton-card__meta">
                  <span className="admin-history-skeleton-line admin-history-skeleton-line--sm" />
                  <span className="admin-history-skeleton-line admin-history-skeleton-line--xs" />
                </div>
                <div className="admin-history-skeleton-card__badges">
                  <span className="admin-history-skeleton-pill" />
                  <span className="admin-history-skeleton-pill admin-history-skeleton-pill--short" />
                </div>
                <span className="admin-history-skeleton-line admin-history-skeleton-line--lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTimelineLoading;
