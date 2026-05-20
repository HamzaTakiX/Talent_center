/**
 * Design system plateforme ESCA — partagé admin + student.
 */

export * from './platformTokens';

export { default as PlatformKpiStrip } from './PlatformKpiStrip';
export type { PlatformKpiItem } from './PlatformKpiStrip';

export { default as PlatformModuleSection } from './PlatformModuleSection';

export {
  AdminPageContent,
  AdminPageHero,
  AdminModulePanel,
  AdminModuleHeader,
  AdminModuleToolbar,
  AdminListToolbar,
  AdminKpiGrid,
  AdminKpiStatCard,
  AdminButton,
  AdminSearchInput,
  AdminSearchEmptyState,
  AdminEmptyState,
  AdminTableScroll,
  AdminModal,
  AdminBadge,
  AdminPagination,
  AdminBackButton,
  AdminSectionSkeletonShell,
  AdminKpiStripSkeleton,
  AdminPanelListSkeleton,
  AdminModulePageSkeleton,
  AdminStatChartSection,
  StatPageChart,
  staggerContainer,
  staggerItem,
  fadeInUp,
  easePremium,
  scaleTap,
} from '../features/admin/ui';

export { tonesFromBgClass } from '../features/admin/ui/adminKpiTones';

export { useAdminTheme } from '../features/admin/dashboard/context/AdminThemeContext';
