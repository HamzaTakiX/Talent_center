import { FunctionComponent } from 'react';
import { FileEdit } from 'lucide-react';
import AdminSectionEmptyState from '../../../../ui/AdminSectionEmptyState';

/** État vide rapports encadrants (zone graphique). */
const EncadrantsReportsEmptyState: FunctionComponent = () => (
  <AdminSectionEmptyState
    variant="inline"
    titleKey="admin.empty.encadrantsNoReports"
    descriptionKey="admin.empty.encadrantsNoReportsDesc"
    icon={
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,#f97316_18%,var(--admin-bg-elevated))] text-[#f97316]">
        <FileEdit className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
    }
  />
);

export default EncadrantsReportsEmptyState;
