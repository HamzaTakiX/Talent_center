import { FunctionComponent } from 'react';
import SafeTooltip from './SafeTooltip';
import { sanitizeTableCellText } from '../utils/sanitizeTableCellText';

interface SafeLocationCellProps {
  children: string;
  className?: string;
}

/** Localisation — une ligne + ellipsis + tooltip. */
const SafeLocationCell: FunctionComponent<SafeLocationCellProps> = ({ children, className = '' }) => {
  const text = sanitizeTableCellText(children);
  const showTooltip = text.length > 24;

  return (
    <SafeTooltip content={text} disabled={!showTooltip}>
      <span className={`safe-location-cell ${className}`.trim()}>{text || '—'}</span>
    </SafeTooltip>
  );
};

export default SafeLocationCell;
