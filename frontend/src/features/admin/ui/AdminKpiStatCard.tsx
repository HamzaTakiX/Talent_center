import { CSSProperties, FunctionComponent, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { scaleTap, staggerItem } from '../dashboard/ui/animations';

interface AdminKpiStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: string;
  accentBg?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  index?: number;
  valueClassName?: string;
}

const AdminKpiStatCard: FunctionComponent<AdminKpiStatCardProps> = ({
  label,
  value,
  icon: Icon,
  accent = 'var(--admin-brand)',
  accentBg = 'var(--admin-brand-muted)',
  onClick,
  index = 0,
  valueClassName,
}) => {
  const isInteractive = Boolean(onClick);
  const toneStyle = {
    '--stat-accent': accent,
    '--stat-accent-bg': accentBg,
  } as CSSProperties;

  return (
    <motion.button
      type="button"
      variants={staggerItem}
      custom={index}
      onClick={isInteractive ? onClick : (e) => e.preventDefault()}
      style={toneStyle}
      whileTap={isInteractive ? scaleTap.whileTap : undefined}
      className={`admin-kpi-cell group focus-visible:outline-none ${
        isInteractive ? '' : 'admin-kpi-cell--static'
      }`}
      tabIndex={isInteractive ? 0 : -1}
      aria-disabled={!isInteractive}
    >
      <span
        className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full opacity-80"
        style={{ background: accent }}
        aria-hidden
      />
      <span className="admin-kpi-icon-wrap">
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="admin-kpi-label block truncate">{label}</span>
        <span className={`admin-kpi-value mt-0.5 block truncate${valueClassName ? ` ${valueClassName}` : ''}`}>
          {value}
        </span>
      </span>
      {isInteractive ? (
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
          strokeWidth={2}
          aria-hidden
        />
      ) : (
        <span className="admin-kpi-cell__chevron-spacer" aria-hidden />
      )}
    </motion.button>
  );
};

export default AdminKpiStatCard;
