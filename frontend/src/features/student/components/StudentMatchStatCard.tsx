import { CSSProperties, FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, FileText, ShieldCheck, Target, User } from 'lucide-react';
import { getScoreColorVar, getScoreTone } from '../internship_offers/CV_Analyse/utils/cvAnalysisScore';

export type StudentMatchStatKey = 'overall' | 'profile' | 'cv' | 'eligibility';

interface StudentMatchStatCardPercentProps {
  statKey: Exclude<StudentMatchStatKey, 'eligibility'>;
  label: string;
  value: number;
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

const StudentMatchStatCard: FunctionComponent<StudentMatchStatCardProps> = (props) => {
  const Icon = STAT_ICONS[props.statKey];
  const isPercent = props.statKey !== 'eligibility';
  const tier = isPercent ? getScoreTone(props.value) : props.isEligible ? 'high' : 'medium';
  const accentColor = isPercent
    ? getScoreColorVar(tier)
    : props.isEligible
      ? 'var(--cva-score-high, #22c55e)'
      : 'var(--cva-score-medium, #f59e0b)';

  const displayValue = isPercent
    ? `${props.value}%`
    : props.isEligible
      ? props.eligibleLabel
      : props.notEligibleLabel;

  return (
    <div
      className="student-match-stat-card"
      data-score-tier={tier}
      data-stat-key={props.statKey}
      style={{ '--stat-accent': accentColor } as CSSProperties}
    >
      <div className="student-match-stat-card__icon" aria-hidden>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>

      <div className="student-match-stat-card__body">
        <span className="student-match-stat-card__label">{props.label}</span>
        <span
          className={`student-match-stat-card__value${isPercent ? '' : ' student-match-stat-card__value--status'}`}
        >
          {displayValue}
        </span>
      </div>

      {isPercent ? (
        <div
          className="student-match-stat-card__track"
          role="presentation"
          aria-hidden
        >
          <div
            className="student-match-stat-card__fill"
            style={{ width: `${Math.min(100, Math.max(0, props.value))}%` }}
          />
        </div>
      ) : (
        <div className="student-match-stat-card__status" aria-hidden>
          {props.isEligible ? (
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StudentMatchStatCard;
