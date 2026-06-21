import { FunctionComponent } from 'react';
import SafeTooltip from './SafeTooltip';
import { sanitizeTableCellText } from '../utils/sanitizeTableCellText';

interface SafeCompanyCellProps {
  children: string;
  className?: string;
}

/** Nom d'entreprise — une ligne + ellipsis + tooltip. */
const SafeCompanyCell: FunctionComponent<SafeCompanyCellProps> = ({ children, className = '' }) => {
  const text = sanitizeTableCellText(children);
  const showTooltip = text.length > 28;

  return (
    <SafeTooltip content={text} disabled={!showTooltip}>
      <span className={`safe-company-cell ${className}`.trim()}>{text || '—'}</span>
    </SafeTooltip>
  );
};

export default SafeCompanyCell;
