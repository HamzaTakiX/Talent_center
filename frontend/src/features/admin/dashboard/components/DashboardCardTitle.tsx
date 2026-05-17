import { FunctionComponent, ReactNode } from 'react';

interface DashboardCardTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const DashboardCardTitle: FunctionComponent<DashboardCardTitleProps> = ({
  title,
  subtitle,
  icon,
  action,
}) => (
  <div className="flex w-full items-start justify-between gap-4">
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2.5">
        {icon != null && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-brand-muted)] text-[var(--admin-brand)] [&_svg]:h-[18px] [&_svg]:w-[18px]">
            {icon}
          </span>
        )}
        <h2 className="truncate text-[15px] font-semibold tracking-tight text-[var(--admin-text)]">
          {title}
        </h2>
      </div>
      {subtitle != null && subtitle !== '' && (
        <p className="mt-1 text-sm leading-relaxed text-[var(--admin-text-secondary)]">{subtitle}</p>
      )}
    </div>
    {action != null && <div className="shrink-0">{action}</div>}
  </div>
);

export default DashboardCardTitle;
