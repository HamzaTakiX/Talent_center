import { FunctionComponent, ReactNode } from 'react';
import AdminListToolbar from './AdminListToolbar';
import type { AdminListToolbarFilterConfig } from './AdminListToolbar';
import AdminModuleHeader from './AdminModuleHeader';

export interface AdminStatDetailPanelProps {
  title: string;
  subtitle: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  toolbarAriaLabel?: string;
  filter1?: AdminListToolbarFilterConfig;
  filter2?: AdminListToolbarFilterConfig;
  children: ReactNode;
}

/**
 * Panneau liste détail (carte stats) — titre, recherche/filtres, puis table.
 * Placer `AdminStatChartSection` en sibling **au-dessus** de ce panneau (pas dans `children`),
 * pour garder recherche et tableau groupés.
 */
const AdminStatDetailPanel: FunctionComponent<AdminStatDetailPanelProps> = ({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  toolbarAriaLabel = 'Filter list',
  filter1,
  filter2,
  children,
}) => (
  <div className="box-border flex w-full min-w-0 flex-col admin-module-panel font-inter shadow-sm">
    <AdminModuleHeader
      layout="toolbar"
      title={title}
      subtitle={subtitle}
      actions={
        <AdminListToolbar
          controlsLayout="grouped"
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          toolbarAriaLabel={toolbarAriaLabel}
          filter1={filter1}
          filter2={filter2}
        />
      }
    />
    {children}
  </div>
);

export default AdminStatDetailPanel;
