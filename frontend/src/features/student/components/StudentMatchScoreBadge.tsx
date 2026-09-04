import { CSSProperties, FunctionComponent } from 'react';
import { getScoreTone } from '../internship_offers/CV_Analyse/utils/cvAnalysisScore';
import { STUDENT_MATCH_SCORE } from '../design-system/studentSemanticStyles';

interface StudentMatchScoreBadgeProps {
  percent: number;
  label: string;
  size?: 'default' | 'detail';
  className?: string;
}

const StudentMatchScoreBadge: FunctionComponent<StudentMatchScoreBadgeProps> = ({
  percent,
  label,
  size = 'default',
  className = '',
}) => {
  const tier = getScoreTone(percent);
  const clamped = Math.min(100, Math.max(0, Math.round(Number(percent) || 0)));
  const sizeClass = size === 'detail' ? 'student-match-score--detail' : '';

  return (
    <div
      className={`${STUDENT_MATCH_SCORE} ${sizeClass} ${className}`.trim()}
      data-score-tier={tier}
      style={{ '--student-match-pie': clamped } as CSSProperties}
      aria-label={`${label}: ${clamped}%`}
    >
      <div className="student-match-score__pie" role="img" aria-hidden>
        <span className="student-match-score__pie-inner">{clamped}%</span>
      </div>
      <span className="student-match-score__label">{label}</span>
    </div>
  );
};

export default StudentMatchScoreBadge;
