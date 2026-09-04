import { createElement, FunctionComponent } from 'react';
import type { LucideIcon } from 'lucide-react';

export type PlatformHeaderBrandProps = {
  title: string;
  subtitle?: string | null;
  icon: LucideIcon;
  titleAs?: 'h1' | 'h2';
  subtitleClassName?: string;
  className?: string;
};

/** Shared compact page brand block for portal navbars and chat sidebar headers. */
const PlatformHeaderBrand: FunctionComponent<PlatformHeaderBrandProps> = ({
  title,
  subtitle,
  icon: Icon,
  titleAs = 'h1',
  subtitleClassName = '',
  className = '',
}) => (
  <div className={['platform-header-brand', className].filter(Boolean).join(' ')}>
    <span className="platform-header-brand-icon" aria-hidden>
      <Icon strokeWidth={2.25} />
    </span>
    <div className="platform-header-brand-text">
      {createElement(titleAs, { className: 'platform-header-brand-title' }, title)}
      {subtitle ? (
        <p
          className={['platform-header-brand-subtitle', subtitleClassName].filter(Boolean).join(' ')}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  </div>
);

export default PlatformHeaderBrand;
