import { FunctionComponent, Fragment } from 'react';

interface MatchHighlightProps {
  text: string;
  matchedIndices: number[];
  className?: string;
}

const MatchHighlight: FunctionComponent<MatchHighlightProps> = ({
  text,
  matchedIndices,
  className = '',
}) => {
  if (!matchedIndices.length) {
    return <span className={className}>{text}</span>;
  }

  const matchSet = new Set(matchedIndices);
  const parts: { char: string; highlight: boolean }[] = [];

  for (let i = 0; i < text.length; i++) {
    parts.push({ char: text[i], highlight: matchSet.has(i) });
  }

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark key={i} className="admin-cmd-highlight">
            {part.char}
          </mark>
        ) : (
          <Fragment key={i}>{part.char}</Fragment>
        )
      )}
    </span>
  );
};

export default MatchHighlight;
