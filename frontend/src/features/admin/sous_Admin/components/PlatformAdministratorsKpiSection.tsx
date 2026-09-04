import { CSSProperties, FunctionComponent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, FileText, MessageSquare, Shield, Wallet } from 'lucide-react';
import type { AdminAdministratorRow } from '../../api/types';
import { easePremium } from '../../dashboard/ui/animations';
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';
import { AdminKpiStripSkeleton } from '../../ui/AdminSectionSkeleton';
import { PLATFORM_ADMIN_KPI_STAT_TO_PATH } from '../constants/platformAdministratorsNavigation';
import type { PlatformAdminKpiStatKey } from '../types/platformAdministrators';

interface PlatformAdministratorsKpiSectionProps {
  rows: AdminAdministratorRow[];
  loading?: boolean;
}

interface AdminKpiCardItem {
  labelKey: string;
  statKey: PlatformAdminKpiStatKey;
  value: string;
  badge: string;
  Icon: typeof Shield;
  accent: string;
  accentBg: string;
  piePercent?: number;
}

const PlatformAdministratorsKpiSection: FunctionComponent<PlatformAdministratorsKpiSectionProps> = ({
  rows,
  loading = false,
}) => {
  const navigate = useNavigate();
  const translateLabel = useTranslateAdminLabel();

  const stats = useMemo<AdminKpiCardItem[]>(() => {
    const total = rows.length;
    const countByRole = (slug: string) =>
      rows.filter((r) => r.role_slugs.includes(slug as never)).length;
    const ratioFromTotal = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

    const stageCount = countByRole('stage');
    const financeCount = countByRole('finance');
    const docsCount = countByRole('documents');
    const comCount = countByRole('communication');

    return [
      {
        labelKey: 'administrators.totalAdmins',
        statKey: 'total' as PlatformAdminKpiStatKey,
        value: String(total),
        badge: `${rows.filter((r) => r.is_active).length} actifs`,
        Icon: Shield,
        accent: '#a855f7',
        accentBg: 'rgba(168, 85, 247, 0.16)',
      },
      {
        labelKey: 'administrators.stage',
        statKey: 'stage' as PlatformAdminKpiStatKey,
        value: String(stageCount),
        badge: `${ratioFromTotal(stageCount)}% du total`,
        Icon: Briefcase,
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.16)',
        piePercent: ratioFromTotal(stageCount),
      },
      {
        labelKey: 'administrators.finance',
        statKey: 'finance' as PlatformAdminKpiStatKey,
        value: String(financeCount),
        badge: `${ratioFromTotal(financeCount)}% du total`,
        Icon: Wallet,
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.16)',
        piePercent: ratioFromTotal(financeCount),
      },
      {
        labelKey: 'administrators.documents',
        statKey: 'documents' as PlatformAdminKpiStatKey,
        value: String(docsCount),
        badge: `${ratioFromTotal(docsCount)}% du total`,
        Icon: FileText,
        accent: '#f97316',
        accentBg: 'rgba(249, 115, 22, 0.16)',
        piePercent: ratioFromTotal(docsCount),
      },
      {
        labelKey: 'administrators.communication',
        statKey: 'communication' as PlatformAdminKpiStatKey,
        value: String(comCount),
        badge: `${ratioFromTotal(comCount)}% du total`,
        Icon: MessageSquare,
        accent: '#6366f1',
        accentBg: 'rgba(99, 102, 241, 0.16)',
        piePercent: ratioFromTotal(comCount),
      },
    ];
  }, [rows]);

  if (loading && rows.length === 0) {
    return <AdminKpiStripSkeleton count={5} />;
  }

  return (
    <div className="admin-students-stats-grid admin-students-stats-grid--center-last">
      {stats.map((card, index) => {
        const title = translateLabel(card.labelKey, card.labelKey);
        const isClickable = card.statKey !== 'total';

        return (
          <motion.article
            key={card.statKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: easePremium }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`admin-students-stat-card${card.piePercent != null ? ' admin-students-stat-card--rate' : ''}${isClickable ? ' cursor-pointer' : ''}`}
            style={
              {
                '--student-stat-accent': card.accent,
                '--student-stat-accent-bg': card.accentBg,
              } as CSSProperties
            }
            onClick={
              isClickable
                ? () =>
                    navigate(
                      PLATFORM_ADMIN_KPI_STAT_TO_PATH[
                        card.statKey as Exclude<PlatformAdminKpiStatKey, 'total'>
                      ],
                    )
                : undefined
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

export default PlatformAdministratorsKpiSection;
