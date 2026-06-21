import { FunctionComponent, ReactNode } from 'react';
import { BACK_BUTTON_ROW_CLASS } from './useBackNavigation';

interface BackButtonRowProps {
  children: ReactNode;
  className?: string;
}

const BackButtonRow: FunctionComponent<BackButtonRowProps> = ({ children, className = '' }) => (
  <div className={[BACK_BUTTON_ROW_CLASS, className].filter(Boolean).join(' ')}>{children}</div>
);

export default BackButtonRow;
