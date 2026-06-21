import { FunctionComponent, type ElementType } from 'react';
import SafeTooltip from './SafeTooltip';
import { sanitizeTableCellText } from '../utils/sanitizeTableCellText';

interface SafeTextProps {
  children: string;
  as?: ElementType;
  className?: string;
  title?: string;
}

/** Texte sur une ligne avec ellipsis et tooltip. */
const SafeText: FunctionComponent<SafeTextProps> = ({
  children,
  as: Tag = 'span',
  className = '',
  title,
}) => {
  const text = sanitizeTableCellText(children);
  const showTooltip = text.length > 40;

  return (
    <SafeTooltip content={title ?? text} disabled={!showTooltip}>
      <Tag className={`safe-truncate-single-line ${className}`.trim()}>{text || '—'}</Tag>
    </SafeTooltip>
  );
};

export default SafeText;
