import { FunctionComponent, useId, useState } from 'react';
import {
  SAFE_LINE_CLAMP_2,
  SAFE_LINE_CLAMP_3,
  SAFE_LINE_CLAMP_5,
  SAFE_MIN_WIDTH,
} from '../classes';

type ClampLines = 2 | 3 | 4 | 5;

const CLAMP_CLASS: Record<ClampLines, string> = {
  2: SAFE_LINE_CLAMP_2,
  3: SAFE_LINE_CLAMP_3,
  4: `${SAFE_MIN_WIDTH} line-clamp-4 break-words`,
  5: SAFE_LINE_CLAMP_5,
};

interface SafeClampTextProps {
  children: string;
  lines?: ClampLines;
  className?: string;
  expandLabel?: string;
  collapseLabel?: string;
}

const SafeClampText: FunctionComponent<SafeClampTextProps> = ({
  children,
  lines = 3,
  className = '',
  expandLabel = 'Lire la suite',
  collapseLabel = 'Réduire',
}) => {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const needsToggle = children.length > lines * 80;

  return (
    <div className={`min-w-0 max-w-full ${className}`.trim()}>
      <p
        id={contentId}
        className={expanded ? 'm-0 min-w-0 break-words' : `m-0 ${CLAMP_CLASS[lines]}`}
      >
        {children}
      </p>
      {needsToggle && (
        <button
          type="button"
          className="safe-expand-btn"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      )}
    </div>
  );
};

export default SafeClampText;
