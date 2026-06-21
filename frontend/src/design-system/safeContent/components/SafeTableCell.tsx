import { FunctionComponent, type ReactNode } from 'react';
import SafeTooltip from './SafeTooltip';
import { sanitizeTableCellText } from '../utils/sanitizeTableCellText';

export type SafeTableCellVariant = 'default' | 'title' | 'company' | 'location';

interface SafeTableCellProps {
  children: ReactNode;
  /** @deprecated Utiliser SafeTitleCell / SafeCompanyCell / SafeLocationCell ou variant */
  wide?: boolean;
  variant?: SafeTableCellVariant;
  className?: string;
  title?: string;
}

const VARIANT_CLASS: Record<SafeTableCellVariant, string> = {
  default: 'safe-table-cell',
  title: 'safe-title-cell',
  company: 'safe-company-cell',
  location: 'safe-location-cell',
};

const SafeTableCell: FunctionComponent<SafeTableCellProps> = ({
  children,
  wide = false,
  variant = 'default',
  className = '',
  title,
}) => {
  const text = typeof children === 'string' ? sanitizeTableCellText(children) : undefined;
  const display = text ?? children;
  const tooltipContent = title ?? text ?? '';
  const showTooltip = Boolean(text && text.length > (variant === 'title' ? 40 : 28));

  return (
    <SafeTooltip content={tooltipContent} disabled={!showTooltip}>
      <span
        className={`${VARIANT_CLASS[variant]} ${wide ? 'safe-table-cell--wide' : ''} ${className}`.trim()}
      >
        {display}
      </span>
    </SafeTooltip>
  );
};

export default SafeTableCell;
