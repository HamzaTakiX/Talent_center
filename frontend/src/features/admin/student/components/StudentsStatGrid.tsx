import { CSSProperties, FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle,
  Percent,
  TrendingUp,
  UserX,
  Users,
} from 'lucide-react';
import { easePremium } from '../../dashboard/ui/animations';
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';
import type { StudentDashboardStats } from '../../api/types';
import { AdminKpiStripSkeleton } from '../../ui/AdminSectionSkeleton';

interface StudentsStatGridProps {
  stats?: StudentDashboardStats | null;
  loading?: boolean;
}

interface StudentStatsCardItem {
  labelKey: string;
  value: string;
  badge: string;
  Icon: typeof Users;
  accent: string;
  accentBg: string;
  piePercent?: number;
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const StudentsStatGrid: FunctionComponent<StudentsStatGridProps> = ({ stats = null, loading = false }) => {
  const translateLabel = useTranslateAdminLabel();

  const displayStats = useMemo<StudentStatsCardItem[]>(() => {
    const data: StudentDashboardStats = stats ?? {
      total: 0,
      active: 0,
      inactive: 0,
      without_internship: 0,
      with_internship: 0,
      engagement_percent: 0,
    };
    const total = Math.max(data.total, 0);
    const ratioFromTotal = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

    return [
      {
        labelKey: 'students.totalStudents',
        value: String(data.total),
        badge: `${data.active} actifs`,
        Icon: Users,
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.16)',
      },
      {
        labelKey: 'students.active',
        value: String(data.active),
        badge: `${ratioFromTotal(data.active)}% du total`,
        Icon: CheckCircle,
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.16)',
        piePercent: ratioFromTotal(data.active),
      },
      {
        labelKey: 'students.inactive',
        value: String(data.inactive),
        badge: `${ratioFromTotal(data.inactive)}% du total`,
        Icon: UserX,
        accent: '#64748b',
        accentBg: 'rgba(100, 116, 139, 0.16)',
        piePercent: ratioFromTotal(data.inactive),
      },
      {
        labelKey: 'students.withoutInternship',
        value: String(data.without_internship),
        badge: `${ratioFromTotal(data.without_internship)}% du total`,
        Icon: AlertTriangle,
        accent: '#f97316',
        accentBg: 'rgba(249, 115, 22, 0.16)',
        piePercent: ratioFromTotal(data.without_internship),
      },
      {
        labelKey: 'students.withInternship',
        value: String(data.with_internship),
        badge: `${ratioFromTotal(data.with_internship)}% du total`,
        Icon: Briefcase,
        accent: '#6366f1',
        accentBg: 'rgba(99, 102, 241, 0.16)',
        piePercent: ratioFromTotal(data.with_internship),
      },
      {
        labelKey: 'students.engagementLevel',
        value: `${clampPercent(data.engagement_percent)}%`,
        badge: 'Niveau moyen',
        Icon: total > 0 ? TrendingUp : Percent,
        accent: '#a855f7',
        accentBg: 'rgba(168, 85, 247, 0.16)',
        piePercent: clampPercent(data.engagement_percent),
      },
    ];
  }, [stats]);

  if (loading) {
    return <AdminKpiStripSkeleton count={6} />;
  }

  return (
    <div className="admin-students-stats-grid">
      {displayStats.map((card, index) => {
        const title = translateLabel('', card.labelKey);

        return (
          <motion.article
            key={card.labelKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`admin-students-stat-card${card.piePercent != null ? ' admin-students-stat-card--rate' : ''}`}
            style={
              {
                '--student-stat-accent': card.accent,
                '--student-stat-accent-bg': card.accentBg,
              } as CSSProperties
            }
          >
            <div className="admin-students-stat-card__body">
              <div className="admin-students-stat-card__head">
                <span className="admin-students-stat-card__icon">
                  <card.Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <p className="admin-students-stat-card__title">{title}</p>
              </div>

              <p className="admin-students-stat-card__value">{card.value}</p>
              <span className="admin-students-stat-card__badge">{card.badge}</span>
            </div>

            {card.piePercent != null ? (
              <div
                className="admin-students-stat-card__pie"
                style={
                  {
                    '--student-stat-pie': card.piePercent,
                  } as CSSProperties
                }
                role="img"
                aria-label={`${title} ${card.piePercent}%`}
              >
                <span className="admin-students-stat-card__pie-inner">{card.piePercent}%</span>
              </div>
            ) : null}
          </motion.article>
        );
      })}
    </div>
  );
};

export default StudentsStatGrid;
