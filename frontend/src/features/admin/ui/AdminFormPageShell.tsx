import { FunctionComponent, ReactNode } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../dashboard/components/AdminLayout';
import { staggerContainer } from '../dashboard/ui/animations';
import AdminPageHero from './AdminPageHero';
import { motion } from 'framer-motion';

export interface AdminFormBreadcrumb {
  label: string;
  onClick?: () => void;
}

interface AdminFormPageShellProps {
  backLabel: string;
  onBack: () => void;
  breadcrumbs?: AdminFormBreadcrumb[];
  /** Hero page (même style que dashboard / profil). */
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: ReactNode;
  heroAction?: ReactNode;
  children: ReactNode;
  /** Aligné sur AdminModulePageShell « wide » (défaut 1600px). */
  width?: 'default' | 'wide' | 'narrow';
}

const widthClass = {
  default: 'max-w-[1680px]',
  wide: 'max-w-[1600px]',
  narrow: 'max-w-[1228px]',
} as const;

const AdminFormPageShell: FunctionComponent<AdminFormPageShellProps> = ({
  backLabel,
  onBack,
  breadcrumbs,
  heroTitle,
  heroSubtitle,
  heroBadge,
  heroAction,
  children,
  width = 'wide',
}) => (
  <AdminLayout>
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={`admin-page mx-auto w-full min-w-0 flex flex-col gap-5 font-inter ${widthClass[width]}`}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Fil d'Ariane"
          className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--admin-text-secondary)]"
        >
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
              )}
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="font-medium text-[var(--admin-text-secondary)] transition-colors hover:text-[var(--admin-text)]"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="font-medium text-[var(--admin-text)]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <button
        type="button"
        onClick={onBack}
        className="admin-btn-secondary inline-flex h-9 w-fit shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        <span className="leading-5">{backLabel}</span>
      </button>

      {heroTitle ? (
        <AdminPageHero
          title={heroTitle}
          subtitle={heroSubtitle}
          badge={heroBadge}
          action={heroAction}
        />
      ) : null}

      <div className="min-w-0">{children}</div>
    </motion.div>
  </AdminLayout>
);

export default AdminFormPageShell;
