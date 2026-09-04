import { CSSProperties, FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileText, ShieldCheck, Target, User } from 'lucide-react';
import { getScoreTone } from '../internship_offers/CV_Analyse/utils/cvAnalysisScore';

export type StudentMatchStatKey = 'overall' | 'profile' | 'cv' | 'eligibility';

interface StudentMatchStatCardPercentProps {
  statKey: Exclude<StudentMatchStatKey, 'eligibility'>;
  label: string;
  value: number;
  badge?: string;
}

interface StudentMatchStatCardStatusProps {
  statKey: 'eligibility';
  label: string;
  isEligible: boolean;
  eligibleLabel: string;
  notEligibleLabel: string;
}

export type StudentMatchStatCardProps =
  | StudentMatchStatCardPercentProps
  | StudentMatchStatCardStatusProps;

const STAT_ICONS: Record<StudentMatchStatKey, LucideIcon> = {
  overall: Target,
  profile: User,
  cv: FileText,
  eligibility: ShieldCheck,
};

const TIER_ACCENTS: Record<'high' | 'medium' | 'low', { accent: string; accentBg: string }> = {
  high: { accent: '#22c55e', accentBg: 'rgba(34, 197, 94, 0.16)' },
  medium: { accent: '#f59e0b', accentBg: 'rgba(245, 158, 11, 0.16)' },
  low: { accent: '#f97316', accentBg: 'rgba(249, 115, 22, 0.16)' },
};

const StudentMatchStatCard: FunctionComponent<StudentMatchStatCardProps> = (props) => {
  const Icon = STAT_ICONS[props.statKey];
  const isPercent = props.statKey !== 'eligibility';

  const tier = isPercent
    ? getScoreTone(props.value)
    : props.isEligible
      ? 'high'
      : 'medium';
  const colors = TIER_ACCENTS[tier];

  const clamped = isPercent ? Math.min(100, Math.max(0, Math.round(Number(props.value) || 0))) : null;

  const displayValue = isPercent
    ? String(clamped)
    : props.isEligible
      ? props.eligibleLabel
      : props.notEligibleLabel;

  const badge = isPercent
    ? (props.badge ?? `${clamped}%`)
    : props.isEligible
      ? props.eligibleLabel
      : props.notEligibleLabel;

  const piePercent = isPercent ? clamped : props.isEligible ? 100 : 0;

  return (
    <article
      className="admin-students-stat-card admin-students-stat-card--compact admin-students-stat-card--rate"
      data-score-tier={tier}
      data-stat-key={props.statKey}
      style={
        {
          '--student-stat-accent': colors.accent,
          '--student-stat-accent-bg': colors.accentBg,
        } as CSSProperties
      }
    >
      <div className="admin-students-stat-card__body">
        <div className="admin-students-stat-card__head">
          <span className="admin-students-stat-card__icon" aria-hidden>
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <p className="admin-students-stat-card__title">{props.label}</p>
        </div>
        <p
          className={`admin-students-stat-card__value${isPercent ? '' : ' !text-base !leading-snug'}`}
        >
          {displayValue}
          {isPercent ? (
            <span className="text-[0.85em] font-bold opacity-80">%</span>
          ) : null}
        </p>
        <span className="admin-students-stat-card__badge">{badge}</span>
      </div>

      <div
        className="admin-students-stat-card__pie"
        style={{ '--student-stat-pie': piePercent } as CSSProperties}
        role="img"
        aria-label={`${props.label} ${isPercent ? `${piePercent}%` : displayValue}`}
      >
        <span className="admin-students-stat-card__pie-inner">
          {isPercent ? `${piePercent}%` : props.isEligible ? '✓' : '!'}
        </span>
      </div>
    </article>
  );
};

export default StudentMatchStatCard;
