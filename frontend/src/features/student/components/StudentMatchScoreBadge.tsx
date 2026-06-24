import { FunctionComponent } from 'react';
import { Star } from 'lucide-react';
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
  const sizeClass = size === 'detail' ? 'student-match-score--detail' : '';

  return (
    <div
      className={`${STUDENT_MATCH_SCORE} ${sizeClass} ${className}`.trim()}
      data-score-tier={tier}
      aria-label={`${label}: ${percent}%`}
    >
      <div className="student-match-score__value">
        <Star className="student-match-score__star h-4 w-4 shrink-0" aria-hidden />
        <span className="student-match-score__percent">{percent}%</span>
      </div>
      <span className="student-match-score__label">{label}</span>
    </div>
  );
};

export default StudentMatchScoreBadge;
