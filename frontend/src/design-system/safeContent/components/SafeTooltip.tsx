import { FunctionComponent, ReactNode } from 'react';

interface SafeTooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
  /** Désactive le tooltip (ex. contenu court) */
  disabled?: boolean;
}

/** Tooltip accessible — affiche le contenu complet au survol si tronqué. */
const SafeTooltip: FunctionComponent<SafeTooltipProps> = ({
  content,
  children,
  className = '',
  disabled = false,
}) => {
  const trimmed = content.trim();
  if (!trimmed || disabled) {
    return <>{children}</>;
  }

  return (
    <span
      className={`safe-tooltip ${className}`.trim()}
      data-tooltip={trimmed}
      title={trimmed}
    >
      {children}
    </span>
  );
};

export default SafeTooltip;
