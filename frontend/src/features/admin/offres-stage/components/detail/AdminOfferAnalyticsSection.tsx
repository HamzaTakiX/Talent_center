import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Eye, TrendingUp, User, Users, type LucideIcon } from 'lucide-react';
import type { OfferDetailViewModel } from '../../utils/offerDetailViewModel';

const ANALYTICS_PREFIX = 'admin.modules.offers.detailPage.analytics';

interface AdminOfferAnalyticsSectionProps {
  viewModel: OfferDetailViewModel;
}

interface AnalyticsMetric {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: 'brand' | 'violet' | 'emerald' | 'amber' | 'sky' | 'rose';
}

const AdminOfferAnalyticsSection: FunctionComponent<AdminOfferAnalyticsSectionProps> = ({
  viewModel,
}) => {
  const { t } = useTranslation();
  const insights = viewModel.applicationInsights;

  const metrics = useMemo<AnalyticsMetric[]>(
    () => [
      {
        key: 'views',
        icon: Eye,
        label: t(`${ANALYTICS_PREFIX}.views`),
        value: viewModel.viewCount,
        tone: 'brand',
      },
      {
        key: 'applications',
        icon: Users,
        label: t(`${ANALYTICS_PREFIX}.applications`),
        value: insights.total,
        tone: 'violet',
      },
      {
        key: 'conversion',
        icon: TrendingUp,
        label: t(`${ANALYTICS_PREFIX}.conversion`),
        value: insights.conversionRate != null ? `${insights.conversionRate}%` : '—',
        tone: 'emerald',
      },
      {
        key: 'pending',
        icon: BarChart3,
        label: t(`${ANALYTICS_PREFIX}.pending`),
        value: insights.pending,
        tone: 'amber',
      },
      {
        key: 'accepted',
        icon: User,
        label: t(`${ANALYTICS_PREFIX}.accepted`),
        value: insights.accepted,
        tone: 'sky',
      },
      {
        key: 'interviewing',
        icon: Users,
        label: t(`${ANALYTICS_PREFIX}.interviewing`),
        value: insights.interviewing,
        tone: 'rose',
      },
    ],
    [insights, t, viewModel.viewCount],
  );

  return (
    <section
      className="offer-detail-analytics"
      aria-label={t(`${ANALYTICS_PREFIX}.title`)}
    >
      <header className="offer-detail-analytics__header">
        <span className="offer-detail-analytics__header-icon" aria-hidden>
          <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h2 className="offer-detail-analytics__title">{t(`${ANALYTICS_PREFIX}.title`)}</h2>
      </header>

      <dl className="offer-detail-analytics__grid">
        {metrics.map(({ key, icon: Icon, label, value, tone }) => (
          <div key={key} className={`offer-detail-analytics__metric offer-detail-analytics__metric--${tone}`}>
            <dt className="offer-detail-analytics__metric-label">
              <span className="offer-detail-analytics__metric-icon" aria-hidden>
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              {label}
            </dt>
            <dd className="offer-detail-analytics__metric-value">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default AdminOfferAnalyticsSection;
