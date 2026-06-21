import { FunctionComponent } from 'react';
import SafeTooltip from './SafeTooltip';
import { sanitizeTableCellText } from '../utils/sanitizeTableCellText';

interface SafeTitleCellProps {
  children: string;
  className?: string;
}

/** Titre d'offre / annonce — clamp 2 lignes + ellipsis + tooltip. */
const SafeTitleCell: FunctionComponent<SafeTitleCellProps> = ({ children, className = '' }) => {
  const text = sanitizeTableCellText(children);
  const showTooltip = text.length > 40;

  return (
    <SafeTooltip content={text} disabled={!showTooltip}>
      <span className={`safe-title-cell ${className}`.trim()}>{text || '—'}</span>
    </SafeTooltip>
  );
};

export default SafeTitleCell;
