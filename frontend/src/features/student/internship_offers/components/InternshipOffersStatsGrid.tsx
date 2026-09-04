import { CSSProperties, FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AdminStudentsStatsSkeleton } from '../../../admin/ui/AdminSectionSkeleton';
import { easePremium } from '../../../admin/dashboard/ui/animations';
import { useStudentInternshipStats } from '../hooks/useStudentStageOffers';
import {
  internshipOffersStatAccentMap,
  internshipOffersStatIconMap,
} from '../constants/internshipOffersStatConfig';
import type { InternshipOffersStatIconKey } from '../types';

const InternshipOffersStatsGrid: FunctionComponent = () => {
  const { t } = useTranslation();
  const { stats, loading } = useStudentInternshipStats();

  const cards = useMemo(() => {
    const byKey = Object.fromEntries(stats.map((stat) => [stat.iconKey, Number(stat.value) || 0])) as Record<
      InternshipOffersStatIconKey,
      number
    >;
    const total = Math.max(byKey.applications ?? 0, 0);
    const ratioFromTotal = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

    const order: InternshipOffersStatIconKey[] = ['applications', 'pending', 'accepted', 'rejected'];

    return order.map((key) => {
      const value = byKey[key] ?? 0;
      const colors = internshipOffersStatAccentMap[key];
      const isTotal = key === 'applications';
      const piePercent = isTotal ? undefined : ratioFromTotal(value);

      return {
        key,
        label: t(`student.internshipOffers.stats.${key}`, {
          defaultValue:
            key === 'applications'
              ? 'Candidatures'
              : key === 'pending'
                ? 'En attente'
                : key === 'accepted'
                  ? 'Acceptées'
                  : 'Refusées',
        }),
        value: String(value),
        badge: isTotal
          ? t('student.internshipOffers.stats.badges.allApplications', {
              defaultValue: 'Toutes les candidatures',
            })
          : t('student.internshipOffers.stats.badges.percentOfTotal', {
              percent: piePercent ?? 0,
              defaultValue: `${piePercent ?? 0}% du total`,
            }),
        Icon: internshipOffersStatIconMap[key],
        accent: colors.accent,
        accentBg: colors.accentBg,
        piePercent,
      };
    });
  }, [stats, t]);

  if (loading) {
    return (
      <div id="internship-offers-stats" className="min-w-0">
        <AdminStudentsStatsSkeleton count={4} compact withPiePattern="all-but-first" />
      </div>
    );
  }

  return (
    <div
      id="internship-offers-stats"
      className="admin-students-stats-grid admin-offers-stats-grid min-w-0"
      aria-label={t('student.internshipOffers.statsAria', {
        defaultValue: 'Statistiques des candidatures',
      })}
    >
      {cards.map((card, index) => (
        <motion.article
          key={card.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={[
            'admin-students-stat-card',
            'admin-students-stat-card--compact',
            card.piePercent != null ? 'admin-students-stat-card--rate' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            {
              '--student-stat-accent': card.accent,
              '--student-stat-accent-bg': card.accentBg,
            } as CSSProperties
          }
        >
          <div className="admin-students-stat-card__body">
            <div className="admin-students-stat-card__head">
              <span className="admin-students-stat-card__icon" aria-hidden>
                <card.Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <p className="admin-students-stat-card__title">{card.label}</p>
            </div>
            <p className="admin-students-stat-card__value">{card.value}</p>
            <span className="admin-students-stat-card__badge">{card.badge}</span>
          </div>
          {card.piePercent != null ? (
            <div
              className="admin-students-stat-card__pie"
              style={{ '--student-stat-pie': card.piePercent } as CSSProperties}
              role="img"
              aria-label={`${card.label} ${card.piePercent}%`}
            >
              <span className="admin-students-stat-card__pie-inner">{card.piePercent}%</span>
            </div>
          ) : null}
        </motion.article>
      ))}
    </div>
  );
};

export default InternshipOffersStatsGrid;
