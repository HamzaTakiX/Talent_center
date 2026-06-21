import { FunctionComponent, useMemo } from 'react';
import { Link2 } from 'lucide-react';
import {
  formatSourceUrlLabel,
  splitTextWithUrls,
  textContainsUrl,
} from '../../shared/formatSourceUrl';

interface HistorySummaryTextProps {
  text: string;
  className?: string;
}

const HistorySummaryText: FunctionComponent<HistorySummaryTextProps> = ({ text, className }) => {
  const segments = useMemo(() => splitTextWithUrls(text), [text]);
  const hasUrl = useMemo(() => textContainsUrl(text), [text]);

  if (!hasUrl) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.kind === 'text') {
          return <span key={`text-${index}`}>{segment.text}</span>;
        }

        const label = formatSourceUrlLabel(segment.url);
        return (
          <a
            key={`url-${index}`}
            href={segment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-history-source-link"
            title={segment.url}
            onClick={(event) => event.stopPropagation()}
          >
            <Link2 className="admin-history-source-link__icon" aria-hidden />
            <span className="admin-history-source-link__label">{label}</span>
          </a>
        );
      })}
    </span>
  );
};

export default HistorySummaryText;
