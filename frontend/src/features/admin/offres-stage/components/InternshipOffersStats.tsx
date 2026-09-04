import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InternshipOfferStatCard from './InternshipOfferStatCard';
import InternshipPopularOfferCard from './InternshipPopularOfferCard';
import { AdminStudentsStatsSkeleton } from '../../ui/AdminSectionSkeleton';
import { useStageDashboard } from '../hooks/useStageOffers';

const parseStatNumber = (value: string): number | null => {
  const cleaned = value.replace(/[^\d.-]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const InternshipOffersStats: FunctionComponent = () => {
  const { t } = useTranslation();
  const { stats, loading, error } = useStageDashboard();

  const enriched = useMemo(() => {
    const totalOffers =
      parseStatNumber(stats.find((s) => s.statKey === 'totalOffers')?.value ?? '') ?? 0;
    const activeOffers =
      parseStatNumber(stats.find((s) => s.statKey === 'activeOffers')?.value ?? '') ?? 0;
    const ratioFromTotal = (value: number) =>
      totalOffers > 0 ? Math.min(100, Math.max(0, Math.round((value / totalOffers) * 100))) : 0;

    return stats.map((stat) => {
      if (stat.popularOffer) {
        return { ...stat, badge: undefined as string | undefined, piePercent: undefined as number | undefined };
      }

      const numeric = parseStatNumber(stat.value);
      let badge: string | undefined;
      let piePercent: number | undefined;

      switch (stat.statKey) {
        case 'totalOffers':
          badge = t('admin.kpi.offers.activeCountBadge', {
            count: activeOffers,
            defaultValue: '{{count}} actives',
          });
          break;
        case 'activeOffers':
        case 'expiredOffers':
        case 'draftOffers':
        case 'closedOffers':
        case 'archivedOffers': {
          const pct = ratioFromTotal(numeric ?? 0);
          badge = t('admin.kpi.offers.shareOfTotal', {
            percent: pct,
            defaultValue: '{{percent}}% du total',
          });
          piePercent = pct;
          break;
        }
        case 'totalApplications':
          badge = t('admin.kpi.offers.applicationsBadge', {
            defaultValue: 'Candidatures',
          });
          break;
        default:
          if (stat.labelKey === 'admin.kpi.offers.acceptanceRate') {
            const rate = numeric ?? 0;
            badge = t('admin.kpi.offers.acceptanceBadge', {
              defaultValue: 'Taux moyen',
            });
            piePercent = Number.isFinite(rate) ? Math.min(100, Math.max(0, Math.round(rate))) : 0;
          }
          break;
      }

      return { ...stat, badge, piePercent };
    });
  }, [stats, t]);

  if (loading) {
    return <AdminStudentsStatsSkeleton count={9} compact withPiePattern />;
  }

  if (error) {
    return (
      <p className="px-4 py-2 text-sm text-[var(--admin-danger)]" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="admin-students-stats-grid admin-offers-stats-grid">
      {enriched.map((stat, index) =>
        stat.popularOffer ? (
          <InternshipPopularOfferCard
            key={stat.statKey ?? stat.label}
            label={stat.label}
            labelKey={stat.labelKey}
            offer={stat.popularOffer}
            index={index}
            compact
          />
        ) : (
          <InternshipOfferStatCard
            key={stat.statKey ?? stat.label}
            label={stat.label}
            labelKey={stat.labelKey}
            valueKey={stat.valueKey}
            value={stat.value}
            icon={stat.icon}
            badge={stat.badge}
            piePercent={stat.piePercent}
            index={index}
            compact
          />
        ),
      )}
    </div>
  );
};

export default InternshipOffersStats;
