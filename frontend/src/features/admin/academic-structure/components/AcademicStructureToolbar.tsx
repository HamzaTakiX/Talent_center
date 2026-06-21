import { FunctionComponent, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminCustomSelect from '../../ui/AdminCustomSelect';
import type { AcademicStructureTab, AcademicTrackRow, ArchivedEntityKind } from '../types/academicStructureTypes';
import { humanizeAcademicLabel } from '../utils/academicStructureDisplay';

const PREFIX = 'admin.modules.academicStructure';

interface AcademicStructureToolbarProps {
  activeTab: AcademicStructureTab;
  search: string;
  onSearchChange: (value: string) => void;
  trackFilter: number | '';
  onTrackFilterChange: (value: number | '') => void;
  archivedKindFilter: ArchivedEntityKind | '';
  onArchivedKindFilterChange: (value: ArchivedEntityKind | '') => void;
  tracks: AcademicTrackRow[];
  onCreate: () => void;
}

const AcademicStructureToolbar: FunctionComponent<AcademicStructureToolbarProps> = ({
  activeTab,
  search,
  onSearchChange,
  trackFilter,
  onTrackFilterChange,
  archivedKindFilter,
  onArchivedKindFilterChange,
  tracks,
  onCreate,
}) => {
  const { t } = useTranslation();
  const isArchivedTab = activeTab === 'archived';
  const showTrackFilter =
    !isArchivedTab &&
    (activeTab === 'levels' || activeTab === 'classes' || activeTab === 'internship-framework');

  const trackOptions = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.allTracks`) },
      ...tracks.map((tr) => ({
        value: String(tr.id),
        label: humanizeAcademicLabel(tr.name),
      })),
    ],
    [tracks, t],
  );

  const archivedKindOptions = useMemo(
    () => [
      { value: '', label: t(`${PREFIX}.archived.allTypes`) },
      { value: 'FILIERE', label: t(`${PREFIX}.archived.types.FILIERE`) },
      { value: 'ACADEMIC_LEVEL', label: t(`${PREFIX}.archived.types.ACADEMIC_LEVEL`) },
      { value: 'CLASS_GROUP', label: t(`${PREFIX}.archived.types.CLASS_GROUP`) },
      { value: 'INTERNSHIP_TYPE', label: t(`${PREFIX}.archived.types.INTERNSHIP_TYPE`) },
      { value: 'WORK_MODE', label: t(`${PREFIX}.archived.types.WORK_MODE`) },
    ],
    [t],
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-secondary)]"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t(`${PREFIX}.searchPlaceholder`)}
          aria-label={t(`${PREFIX}.searchPlaceholder`)}
          className="admin-input w-full rounded-xl py-2 ps-9 pe-3 text-sm"
        />
      </div>

      {showTrackFilter ? (
        <div className="academic-structure-toolbar-filter admin-select-wrap shrink-0">
          <AdminCustomSelect
            variant="default"
            value={trackFilter === '' ? '' : String(trackFilter)}
            options={trackOptions}
            onChange={(value) => onTrackFilterChange(value ? Number(value) : '')}
            searchable
            searchPlaceholder={t(`${PREFIX}.searchPlaceholder`)}
            aria-label={t(`${PREFIX}.columns.track`)}
          />
        </div>
      ) : null}

      {isArchivedTab ? (
        <div className="academic-structure-toolbar-filter admin-select-wrap shrink-0">
          <AdminCustomSelect
            variant="default"
            value={archivedKindFilter}
            options={archivedKindOptions}
            onChange={(value) => onArchivedKindFilterChange((value as ArchivedEntityKind) || '')}
            aria-label={t(`${PREFIX}.archived.filterType`)}
          />
        </div>
      ) : null}

      {!isArchivedTab ? (
        <button
          type="button"
          onClick={onCreate}
          className="admin-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          {t(`${PREFIX}.create`)}
        </button>
      ) : null}
    </div>
  );
};

export default AcademicStructureToolbar;
