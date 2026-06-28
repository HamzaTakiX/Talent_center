import { FunctionComponent, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Shield,
  AlertCircle,
  Briefcase,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  LucideIcon,
  ChevronRight,
} from 'lucide-react';
import { scaleTap, staggerItem } from '../ui/animations';

interface DashboardStatCardProps {
  label: string;
  value: string;
  icon: string;
  onClick?: () => void;
  index?: number;
}

const iconMap: Record<string, LucideIcon> = {
  Users,
  UserCheck,
  Shield,
  AlertCircle,
  Briefcase,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
};

/** Teinte distincte par métrique — subtile, pas de gros blocs colorés */
const toneMap: Record<string, { tone: string; accent: string; bg: string }> = {
  Users: { tone: 'blue', accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  UserCheck: { tone: 'violet', accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  Shield: { tone: 'emerald', accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  AlertCircle: { tone: 'orange', accent: '#ea580c', bg: 'rgba(234, 88, 12, 0.1)' },
  Briefcase: { tone: 'indigo', accent: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
  TrendingUp: { tone: 'cyan', accent: '#0891b2', bg: 'rgba(8, 145, 178, 0.1)' },
  Clock: { tone: 'amber', accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  DollarSign: { tone: 'rose', accent: '#e11d48', bg: 'rgba(225, 29, 72, 0.1)' },
  FileText: { tone: 'amber', accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
};

const DashboardStatCard: FunctionComponent<DashboardStatCardProps> = ({
  label,
  value,
  icon,
  onClick,
  index = 0,
}) => {
  const Icon = iconMap[icon] ?? Users;
  const { tone, accent, bg } = toneMap[icon] ?? toneMap.Users;

  const toneStyle = {
    '--stat-accent': accent,
    '--stat-accent-bg': bg,
  } as CSSProperties;

  return (
    <motion.button
      type="button"
      variants={staggerItem}
      initial="initial"
      animate="animate"
      custom={index}
      onClick={onClick}
      data-tone={tone}
      style={toneStyle}
      whileTap={scaleTap.whileTap}
      className="admin-stat-cell group relative flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors sm:px-4 sm:py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--stat-accent)]"
    >
      <span
        className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full opacity-80"
        style={{ background: accent }}
        aria-hidden
      />

      <span className="admin-stat-icon-wrap flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105">
        <Icon className="h-4 w-4" strokeWidth={1.75} style={{ color: accent }} aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-[var(--admin-text-secondary)] sm:text-xs">
          {label}
        </p>
        <p
          className="mt-0.5 text-lg font-semibold tabular-nums leading-none tracking-tight sm:text-xl"
          style={{ color: accent }}
        >
          {value}
        </p>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
        style={{ color: accent }}
        strokeWidth={2}
        aria-hidden
      />
    </motion.button>
  );
};

export default DashboardStatCard;
