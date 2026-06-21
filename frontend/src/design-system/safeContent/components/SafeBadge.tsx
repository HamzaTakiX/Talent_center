import { FunctionComponent, type ReactNode } from 'react';
import { SAFE_BADGE } from '../classes';

interface SafeBadgeProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const SafeBadge: FunctionComponent<SafeBadgeProps> = ({ children, className = '', title }) => {
  const text = typeof children === 'string' ? children : undefined;
  return (
    <span
      className={`safe-badge ${SAFE_BADGE} ${className}`.trim()}
      title={title ?? (text && text.length > 20 ? text : undefined)}
    >
      {children}
    </span>
  );
};

export default SafeBadge;
