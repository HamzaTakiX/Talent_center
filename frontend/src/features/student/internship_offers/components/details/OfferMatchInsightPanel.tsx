import { FunctionComponent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type MatchInsightTone = 'success' | 'warning' | 'brand';

interface OfferMatchInsightPanelProps {
  tone: MatchInsightTone;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}

const TONE_CLASS: Record<MatchInsightTone, string> = {
  success: 'student-match-insight--success',
  warning: 'student-match-insight--warning',
  brand: 'student-match-insight--brand',
};

/** Encart insight AI match (Strengths / Gaps / Recommendations). */
const OfferMatchInsightPanel: FunctionComponent<OfferMatchInsightPanelProps> = ({
  tone,
  icon: Icon,
  title,
  children,
}) => (
  <article className={`student-match-insight ${TONE_CLASS[tone]}`}>
    <div className="student-match-insight__head">
      <span className="student-match-insight__icon" aria-hidden>
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <h3 className="student-match-insight__title">{title}</h3>
    </div>
    <div className="student-match-insight__body">{children}</div>
  </article>
);

export default OfferMatchInsightPanel;
