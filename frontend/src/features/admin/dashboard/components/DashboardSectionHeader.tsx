import { FunctionComponent, ReactNode } from 'react';

interface DashboardSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  action?: ReactNode;
}

const DashboardSectionHeader: FunctionComponent<DashboardSectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
}) => (
  <header className="admin-section-header relative flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-4 py-4 sm:px-5">
    <span
      className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-[var(--admin-brand)]"
      aria-hidden
    />
    <div className="flex min-w-0 flex-1 items-center gap-3 pl-2">
      <span className="admin-section-icon-wrap flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--admin-brand)] [&_svg]:h-[18px] [&_svg]:w-[18px]">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold tracking-tight text-[var(--admin-text)] sm:text-[15px]">
          {title}
        </h2>
        {subtitle != null && subtitle !== '' && (
          <p className="mt-0.5 text-xs text-[var(--admin-text-secondary)] sm:text-[13px]">{subtitle}</p>
        )}
      </div>
    </div>
    {action != null && <div className="shrink-0">{action}</div>}
  </header>
);

export default DashboardSectionHeader;
