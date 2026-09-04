import { CSSProperties, FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import {
  Archive,
  Briefcase,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Users,
  TrendingUp,
  Award,
  LucideIcon,
} from 'lucide-react';
import { easePremium } from '../../dashboard/ui/animations';
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';

interface InternshipOfferStatCardProps {
  label: string;
  labelKey?: string;
  valueKey?: string;
  value: string;
  icon: string;
  badge?: string;
  piePercent?: number;
  onClick?: () => void;
  index?: number;
  compact?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Archive,
  Users,
  TrendingUp,
  Award,
};

const iconTone: Record<string, { accent: string; accentBg: string }> = {
  Briefcase: { accent: '#3b82f6', accentBg: 'rgba(59, 130, 246, 0.16)' },
  CheckCircle: { accent: '#22c55e', accentBg: 'rgba(34, 197, 94, 0.16)' },
  XCircle: { accent: '#fb2c36', accentBg: 'rgba(251, 44, 54, 0.16)' },
  FileText: { accent: '#eab308', accentBg: 'rgba(234, 179, 8, 0.16)' },
  Clock: { accent: '#64748b', accentBg: 'rgba(100, 116, 139, 0.16)' },
  Archive: { accent: '#6b7280', accentBg: 'rgba(107, 114, 128, 0.16)' },
  Users: { accent: '#8b5cf6', accentBg: 'rgba(139, 92, 246, 0.16)' },
  TrendingUp: { accent: '#6366f1', accentBg: 'rgba(99, 102, 241, 0.16)' },
  Award: { accent: '#06b6d4', accentBg: 'rgba(6, 182, 212, 0.16)' },
};

const InternshipOfferStatCard: FunctionComponent<InternshipOfferStatCardProps> = ({
  label,
  labelKey,
  valueKey,
  value,
  icon,
  badge,
  piePercent,
  onClick,
  index = 0,
  compact = false,
}) => {
  const translateLabel = useTranslateAdminLabel();
  const Icon = iconMap[icon] ?? Briefcase;
  const tone = iconTone[icon] ?? iconTone.Briefcase;
  const title = translateLabel(label, labelKey);
  const displayValue = valueKey ? translateLabel(value, valueKey) : value;
  const isClickable = Boolean(onClick);
  const hasPie = piePercent != null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: easePremium }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={[
        'admin-students-stat-card',
        hasPie ? 'admin-students-stat-card--rate' : '',
        compact ? 'admin-students-stat-card--compact' : '',
        isClickable ? 'cursor-pointer' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--student-stat-accent': tone.accent,
          '--student-stat-accent-bg': tone.accentBg,
        } as CSSProperties
      }
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="admin-students-stat-card__body">
        <div className="admin-students-stat-card__head">
          <span className="admin-students-stat-card__icon">
            <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={1.8} aria-hidden />
          </span>
          <p className="admin-students-stat-card__title">{title}</p>
        </div>

        <p className="admin-students-stat-card__value">{displayValue}</p>
        {badge ? <span className="admin-students-stat-card__badge">{badge}</span> : null}
      </div>

      {hasPie ? (
        <div
          className="admin-students-stat-card__pie"
          style={{ '--student-stat-pie': piePercent } as CSSProperties}
          role="img"
          aria-label={`${title} ${piePercent}%`}
        >
          <span className="admin-students-stat-card__pie-inner">{piePercent}%</span>
        </div>
      ) : null}
    </motion.article>
  );
};

export default InternshipOfferStatCard;
