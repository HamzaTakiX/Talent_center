import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  Briefcase,
  Copy,
  GraduationCap,
  Layers,
  MapPin,
  Pencil,
  Shield,
  Settings2,
  Trash2,
} from 'lucide-react';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminBackButton from '../../ui/AdminBackButton';
import { useAdminPagination } from '../../shared/hooks/useAdminPagination';
import { AdminPagination, AdminTableEmptyState, AdminTableScroll } from '../../ui';
import { academicStructureApi } from '../api/academicStructureApi';
import { invalidateAcademicStructureCatalog } from '../../shared/academic-structure/hooks/useAcademicStructureCatalog';
import AcademicStructureAuditSection from '../components/AcademicStructureAuditSection';
import AcademicStructureToolbar from '../components/AcademicStructureToolbar';
import { useAcademicStructureWorkspace } from '../hooks/useAcademicStructureWorkspace';
import type { AcademicClassRow, AcademicStructureTab, ArchivedEntityKind, ImpactSummary } from '../types/academicStructureTypes';
import type { AcademicStructureFormMode, AcademicStructureFormSubmitPayload } from '../types/academicStructureFormTypes';
import ArchiveImpactDialog from '../components/ArchiveImpactDialog';
import DeleteImpactDialog from '../components/DeleteImpactDialog';
import EntityFormDialog from '../components/EntityFormDialog';
import {
  displayCellValue,
  formatAcademicCode,
  humanizeAcademicLabel,
  humanizeProgramFamily,
} from '../utils/academicStructureDisplay';
import { buildArchivedRows } from '../utils/academicStructureArchived';
import '../styles/academic-structure.css';

const PREFIX = 'admin.modules.academicStructure';
const TABLE_PAGE_SIZE = 5;
const COL_SPAN: Record<AcademicStructureTab, number> = {
  tracks: 6,
  levels: 6,
  classes: 6,
  'internship-framework': 6,
  'work-modes': 5,
  archived: 6,
};
const TH_CELL = 'px-4 py-3';
const TD_CELL = 'px-4 py-3 align-middle';

const TABS: { id: AcademicStructureTab; icon: typeof BookOpen; labelKey: string }[] = [
  { id: 'tracks', icon: BookOpen, labelKey: 'tabs.tracks' },
  { id: 'levels', icon: Layers, labelKey: 'tabs.levels' },
  { id: 'classes', icon: GraduationCap, labelKey: 'tabs.classes' },
  { id: 'internship-framework', icon: Briefcase, labelKey: 'tabs.internshipFramework' },
  { id: 'work-modes', icon: MapPin, labelKey: 'tabs.workModes' },
  { id: 'archived', icon: ArchiveRestore, labelKey: 'tabs.archived' },
];

function StatusBadge({ active, archived }: { active: boolean; archived: boolean }) {
  const { t } = useTranslation();
  if (archived) {
    return <span className="admin-badge admin-badge--warning">{t(`${PREFIX}.status.archived`)}</span>;
  }
  return (
    <span className={`admin-badge ${active ? 'admin-badge--success' : 'admin-badge--neutral'}`}>
      {active ? t(`${PREFIX}.status.active`) : t(`${PREFIX}.status.inactive`)}
    </span>
  );
}

function RowActions({
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  archived,
  editLabel,
  duplicateLabel,
  archiveLabel,
  deleteLabel,
}: {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  archived: boolean;
  editLabel: string;
  duplicateLabel: string;
  archiveLabel: string;
  deleteLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {onEdit ? (
        <button
          type="button"
          className="academic-row-edit-btn inline-flex items-center gap-1.5"
          title={editLabel}
          aria-label={editLabel}
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{editLabel}</span>
        </button>
      ) : null}
      {!archived && onDuplicate ? (
        <button
          type="button"
          className="text-[var(--admin-text-secondary)] hover:text-[var(--admin-brand)]"
          title={duplicateLabel}
          aria-label={duplicateLabel}
          onClick={onDuplicate}
        >
          <Copy className="h-4 w-4" />
        </button>
      ) : null}
      {!archived && onArchive ? (
        <button
          type="button"
          className="academic-row-archive-btn inline-flex items-center gap-1.5"
          title={archiveLabel}
          aria-label={archiveLabel}
          onClick={onArchive}
        >
          <Archive className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{archiveLabel}</span>
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          className="academic-row-delete-btn inline-flex items-center gap-1.5"
          title={deleteLabel}
          aria-label={deleteLabel}
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{deleteLabel}</span>
        </button>
      ) : null}
    </div>
  );
}

const AcademicStructurePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AcademicStructureTab>('tracks');
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<number | ''>('');
  const [archivedKindFilter, setArchivedKindFilter] = useState<ArchivedEntityKind | ''>('');
  const workspace = useAcademicStructureWorkspace(activeTab);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<AcademicStructureFormMode>('create');
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<{
    type: ArchivedEntityKind;
    id: number;
    label: string;
    impact: ImpactSummary | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: ArchivedEntityKind;
    id: number;
    label: string;
    impact: ImpactSummary | null;
  } | null>(null);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);

  const filteredTracks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workspace.tracks;
    return workspace.tracks.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
    );
  }, [workspace.tracks, search]);

  const filteredLevels = useMemo(() => {
    let list = workspace.levels;
    if (trackFilter) list = list.filter((l) => l.filiere_id === trackFilter);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
  }, [workspace.levels, search, trackFilter]);

  const filteredClasses = useMemo(() => {
    let list = workspace.classes;
    if (trackFilter) list = list.filter((r) => r.filiere === trackFilter);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
    );
  }, [workspace.classes, search, trackFilter]);

  const filteredInternshipTypes = useMemo(() => {
    let list = workspace.internshipTypes;
    if (trackFilter) list = list.filter((r) => r.filiere_id === trackFilter);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
  }, [workspace.internshipTypes, search, trackFilter]);

  const filteredWorkModes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workspace.workModes;
    return workspace.workModes.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
    );
  }, [workspace.workModes, search]);

  const archivedRows = useMemo(
    () =>
      buildArchivedRows({
        tracks: workspace.tracks,
        levels: workspace.levels,
        classes: workspace.classes,
        internshipTypes: workspace.internshipTypes,
        workModes: workspace.workModes,
      }),
    [workspace.tracks, workspace.levels, workspace.classes, workspace.internshipTypes, workspace.workModes],
  );

  const filteredArchivedRows = useMemo(() => {
    let list = archivedRows;
    if (archivedKindFilter) list = list.filter((row) => row.kind === archivedKindFilter);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        (row.code?.toLowerCase().includes(q) ?? false) ||
        (row.context?.toLowerCase().includes(q) ?? false) ||
        (row.detail?.toLowerCase().includes(q) ?? false),
    );
  }, [archivedRows, archivedKindFilter, search]);

  const hasActiveFilters = Boolean(
    search.trim() || trackFilter || (activeTab === 'archived' && archivedKindFilter),
  );
  const emptyTitleKey =
    activeTab === 'archived'
      ? hasActiveFilters
        ? `${PREFIX}.noSearchResults`
        : `${PREFIX}.archived.emptyTitle`
      : hasActiveFilters
        ? `${PREFIX}.noSearchResults`
        : `${PREFIX}.emptyTab`;
  const emptyDescriptionKey =
    activeTab === 'archived' && !hasActiveFilters
      ? `${PREFIX}.archived.emptyDescription`
      : hasActiveFilters
        ? 'admin.empty.tryAdjusting'
        : undefined;

  const currentFilteredRows = useMemo(() => {
    switch (activeTab) {
      case 'tracks':
        return filteredTracks;
      case 'levels':
        return filteredLevels;
      case 'classes':
        return filteredClasses;
      case 'internship-framework':
        return filteredInternshipTypes;
      case 'work-modes':
        return filteredWorkModes;
      case 'archived':
        return filteredArchivedRows;
      default:
        return [];
    }
  }, [
    activeTab,
    filteredTracks,
    filteredLevels,
    filteredClasses,
    filteredInternshipTypes,
    filteredWorkModes,
    filteredArchivedRows,
  ]);

  const {
    page: tablePage,
    setPage: setTablePage,
    paginatedItems: paginatedRows,
    totalItems: tableTotalItems,
    totalPages: tableTotalPages,
  } = useAdminPagination(currentFilteredRows, TABLE_PAGE_SIZE);

  useEffect(() => {
    setTablePage(1);
  }, [activeTab, search, trackFilter, archivedKindFilter, setTablePage]);

  const openCreate = () => {
    setEditRow(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditRow(row);
    setFormMode('edit');
    setFormOpen(true);
  };

  const openDuplicate = (row: Record<string, unknown>) => {
    setEditRow(row);
    setFormMode('duplicate');
    setFormOpen(true);
  };

  const requestArchive = async (type: ArchivedEntityKind, id: number, label: string) => {
    try {
      const impact = await academicStructureApi.getImpact(type, id);
      setArchiveTarget({ type, id, label, impact });
    } catch {
      setArchiveTarget({ type, id, label, impact: null });
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget || archiving) return;
    const { type, id } = archiveTarget;
    setArchiving(true);
    try {
      if (type === 'FILIERE') await academicStructureApi.archiveTrack(id);
      else if (type === 'ACADEMIC_LEVEL') await academicStructureApi.archiveLevel(id);
      else if (type === 'CLASS_GROUP') await academicStructureApi.archiveClass(id);
      else if (type === 'INTERNSHIP_TYPE') await academicStructureApi.archiveInternshipType(id);
      else if (type === 'WORK_MODE') await academicStructureApi.archiveWorkMode(id);
      setArchiveTarget(null);
      await workspace.refresh();
      invalidateAcademicStructureCatalog();
    } finally {
      setArchiving(false);
    }
  };

  const requestDelete = async (type: ArchivedEntityKind, id: number, label: string) => {
    try {
      const impact = await academicStructureApi.getImpact(type, id);
      setDeleteTarget({ type, id, label, impact });
    } catch {
      setDeleteTarget({ type, id, label, impact: null });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    const { type, id } = deleteTarget;
    setDeleting(true);
    try {
      if (type === 'FILIERE') await academicStructureApi.deleteTrackPermanently(id);
      else if (type === 'ACADEMIC_LEVEL') await academicStructureApi.deleteLevelPermanently(id);
      else if (type === 'CLASS_GROUP') await academicStructureApi.deleteClassPermanently(id);
      else if (type === 'INTERNSHIP_TYPE') await academicStructureApi.deleteInternshipTypePermanently(id);
      else if (type === 'WORK_MODE') await academicStructureApi.deleteWorkModePermanently(id);
      setDeleteTarget(null);
      await workspace.refresh();
      invalidateAcademicStructureCatalog();
    } finally {
      setDeleting(false);
    }
  };

  const actionLabels = {
    edit: t(`${PREFIX}.edit`),
    duplicate: t(`${PREFIX}.duplicate`),
    archive: t(`${PREFIX}.archive.action`),
    delete: t(`${PREFIX}.delete.action`),
  };

  const renderRowActions = (
    row: { id: number; name: string; is_archived?: boolean },
    type: ArchivedEntityKind,
    options?: { allowEdit?: boolean; allowDuplicate?: boolean; allowArchive?: boolean },
  ) => (
    <RowActions
      editLabel={actionLabels.edit}
      duplicateLabel={actionLabels.duplicate}
      archiveLabel={actionLabels.archive}
      deleteLabel={actionLabels.delete}
      archived={Boolean(row.is_archived)}
      onEdit={
        options?.allowEdit === false
          ? undefined
          : () => openEdit(row as unknown as Record<string, unknown>)
      }
      onDuplicate={
        options?.allowDuplicate === false || row.is_archived
          ? undefined
          : () => openDuplicate(row as unknown as Record<string, unknown>)
      }
      onArchive={
        options?.allowArchive === false || row.is_archived
          ? undefined
          : () => void requestArchive(type, row.id, row.name)
      }
      onDelete={() => void requestDelete(type, row.id, row.name)}
    />
  );

  const handleSave = async ({ values, action }: AcademicStructureFormSubmitPayload) => {
    if (activeTab === 'tracks') {
      if (formMode === 'edit' && editRow?.id) await academicStructureApi.updateTrack(Number(editRow.id), values);
      else await academicStructureApi.createTrack(values);
    } else if (activeTab === 'levels') {
      if (formMode === 'edit' && editRow?.id) await academicStructureApi.updateLevel(Number(editRow.id), values);
      else await academicStructureApi.createLevel(values);
    } else if (activeTab === 'classes') {
      if (formMode === 'edit' && editRow?.id) await academicStructureApi.updateClass(Number(editRow.id), values);
      else await academicStructureApi.createClass(values);
    } else if (activeTab === 'internship-framework') {
      if (formMode === 'edit' && editRow?.id) await academicStructureApi.updateInternshipType(Number(editRow.id), values);
      else await academicStructureApi.createInternshipType(values);
    } else if (activeTab === 'work-modes') {
      if (formMode === 'edit' && editRow?.id) await academicStructureApi.updateWorkMode(Number(editRow.id), values);
      else await academicStructureApi.createWorkMode(values);
    }
    if (action === 'save') setFormOpen(false);
    await workspace.refresh();
    invalidateAcademicStructureCatalog();
  };

  return (
    <AdminModulePageShell width="wide">
      <AdminBackButton
        label={t(`${PREFIX}.backToSettings`)}
        onClick={() => navigate('/admin/profile#settings')}
        className="mb-4"
      />

      <section className="admin-page-hero relative mb-6 overflow-hidden rounded-2xl border border-[var(--admin-border)] p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--admin-brand)] to-[#0ea5e9] text-white">
              <Settings2 className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--admin-brand)]">
                {t(`${PREFIX}.eyebrow`)}
              </p>
              <h1 className="admin-module-title mt-1 text-2xl sm:text-3xl">{t(`${PREFIX}.title`)}</h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.subtitle`)}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--admin-brand)]/25 bg-[var(--admin-brand-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-brand)]">
            <Shield className="h-3.5 w-3.5" />
            {t(`${PREFIX}.superAdminOnly`)}
          </span>
        </div>
      </section>

      <nav className="admin-section-nav mb-4 flex flex-wrap gap-1 rounded-xl border border-[var(--admin-border)] p-1">
        {TABS.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setActiveTab(id);
              if (id === 'archived') setTrackFilter('');
            }}
            className={`admin-section-tab flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              activeTab === id ? 'admin-section-tab--active' : ''
            }`}
          >
            <Icon className="h-4 w-4" />
            {t(`${PREFIX}.${labelKey}`)}
          </button>
        ))}
      </nav>

      <AcademicStructureToolbar
        activeTab={activeTab}
        search={search}
        onSearchChange={setSearch}
        trackFilter={trackFilter}
        onTrackFilterChange={setTrackFilter}
        archivedKindFilter={archivedKindFilter}
        onArchivedKindFilterChange={setArchivedKindFilter}
        tracks={workspace.tracks.filter((tr) => !tr.is_archived)}
        onCreate={openCreate}
      />

      {workspace.error ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {t(`${PREFIX}.errors.${workspace.error}`)}
        </p>
      ) : null}

      {workspace.loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--admin-surface-muted)]" />
          ))}
        </div>
      ) : (
        <div className="admin-module-table-wrap">
          <AdminTableScroll minWidth="720px" className="admin-table-scroll--panel">
            <thead className="text-xs uppercase tracking-wide text-[var(--admin-text-secondary)]">
              {activeTab === 'tracks' && (
                <tr>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.name`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.code`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.family`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.order`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.status`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.actions`)}</th>
                </tr>
              )}
              {activeTab === 'levels' && (
                <tr>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.name`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.code`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.track`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.order`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.status`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.actions`)}</th>
                </tr>
              )}
              {activeTab === 'classes' && (
                <tr>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.name`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.track`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.level`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.year`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.status`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.actions`)}</th>
                </tr>
              )}
              {activeTab === 'internship-framework' && (
                <tr>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.name`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.track`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.level`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.duration`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.status`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.actions`)}</th>
                </tr>
              )}
              {activeTab === 'work-modes' && (
                <tr>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.name`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.code`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.order`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.status`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.actions`)}</th>
                </tr>
              )}
              {activeTab === 'archived' && (
                <tr>
                  <th className={TH_CELL}>{t(`${PREFIX}.archived.columns.type`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.name`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.code`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.archived.columns.context`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.status`)}</th>
                  <th className={TH_CELL}>{t(`${PREFIX}.columns.actions`)}</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {activeTab === 'tracks' &&
                (currentFilteredRows.length === 0 ? (
                  <AdminTableEmptyState
                    colSpan={COL_SPAN.tracks}
                    titleKey={emptyTitleKey}
                    descriptionKey={emptyDescriptionKey}
                  />
                ) : (
                  (paginatedRows as typeof filteredTracks).map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--admin-surface-muted)]/50">
                    <td className={`${TD_CELL} font-medium`}>{humanizeAcademicLabel(row.name)}</td>
                    <td className={`${TD_CELL} font-mono text-xs`}>{formatAcademicCode(row.code)}</td>
                    <td className={TD_CELL}>{humanizeProgramFamily(row.program_family)}</td>
                    <td className={TD_CELL}>{row.sort_order}</td>
                    <td className={TD_CELL}>
                      <div className="flex justify-center">
                        <StatusBadge active={row.is_active} archived={row.is_archived} />
                      </div>
                    </td>
                    <td className={TD_CELL}>
                      {renderRowActions(row, 'FILIERE')}
                    </td>
                  </tr>
                  ))
                ))}
              {activeTab === 'levels' &&
                (currentFilteredRows.length === 0 ? (
                  <AdminTableEmptyState
                    colSpan={COL_SPAN.levels}
                    titleKey={emptyTitleKey}
                    descriptionKey={emptyDescriptionKey}
                  />
                ) : (
                  (paginatedRows as typeof filteredLevels).map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--admin-surface-muted)]/50">
                    <td className={`${TD_CELL} font-medium`}>{humanizeAcademicLabel(row.name)}</td>
                    <td className={`${TD_CELL} font-mono text-xs`}>{formatAcademicCode(row.code)}</td>
                    <td className={TD_CELL}>
                      {displayCellValue(row.filiere_name) || formatAcademicCode(row.filiere_code)}
                    </td>
                    <td className={TD_CELL}>{row.sort_order}</td>
                    <td className={TD_CELL}>
                      <div className="flex justify-center">
                        <StatusBadge active={row.is_active} archived={row.is_archived} />
                      </div>
                    </td>
                    <td className={TD_CELL}>
                      {renderRowActions(row, 'ACADEMIC_LEVEL')}
                    </td>
                  </tr>
                  ))
                ))}
              {activeTab === 'classes' &&
                (currentFilteredRows.length === 0 ? (
                  <AdminTableEmptyState
                    colSpan={COL_SPAN.classes}
                    titleKey={emptyTitleKey}
                    descriptionKey={emptyDescriptionKey}
                  />
                ) : (
                  (paginatedRows as typeof filteredClasses).map((row) => (
                    <tr key={row.id} className="hover:bg-[var(--admin-surface-muted)]/50">
                      <td className={`${TD_CELL} font-medium`}>{humanizeAcademicLabel(row.name)}</td>
                      <td className={TD_CELL}>{displayCellValue(row.filiere_name)}</td>
                      <td className={TD_CELL}>{displayCellValue(row.academic_level_label)}</td>
                      <td className={TD_CELL}>{row.academic_year}</td>
                      <td className={TD_CELL}>
                        <div className="flex justify-center">
                          <StatusBadge active={row.is_active} archived={row.is_archived} />
                        </div>
                      </td>
                      <td className={TD_CELL}>
                        {renderRowActions(row, 'CLASS_GROUP')}
                      </td>
                    </tr>
                  ))
                ))}
              {activeTab === 'internship-framework' &&
                (currentFilteredRows.length === 0 ? (
                  <AdminTableEmptyState
                    colSpan={COL_SPAN['internship-framework']}
                    titleKey={emptyTitleKey}
                    descriptionKey={emptyDescriptionKey}
                  />
                ) : (
                  (paginatedRows as typeof filteredInternshipTypes).map((row) => (
                    <tr key={row.id} className="hover:bg-[var(--admin-surface-muted)]/50">
                      <td className={`${TD_CELL} font-medium`}>{humanizeAcademicLabel(row.name)}</td>
                      <td className={TD_CELL}>{displayCellValue(row.filiere_name)}</td>
                      <td className={TD_CELL}>{displayCellValue(row.level_name)}</td>
                      <td className={TD_CELL}>{displayCellValue(row.duration_hint)}</td>
                      <td className={TD_CELL}>
                        <div className="flex justify-center">
                          <StatusBadge active={row.is_active} archived={row.is_archived} />
                        </div>
                      </td>
                      <td className={TD_CELL}>
                        {renderRowActions(row, 'INTERNSHIP_TYPE')}
                      </td>
                    </tr>
                  ))
                ))}
              {activeTab === 'work-modes' &&
                (currentFilteredRows.length === 0 ? (
                  <AdminTableEmptyState
                    colSpan={COL_SPAN['work-modes']}
                    titleKey={emptyTitleKey}
                    descriptionKey={emptyDescriptionKey}
                  />
                ) : (
                  (paginatedRows as typeof filteredWorkModes).map((row) => (
                    <tr key={row.id} className="hover:bg-[var(--admin-surface-muted)]/50">
                      <td className={`${TD_CELL} font-medium`}>{humanizeAcademicLabel(row.name)}</td>
                      <td className={`${TD_CELL} font-mono text-xs`}>{formatAcademicCode(row.code)}</td>
                      <td className={TD_CELL}>{row.sort_order}</td>
                      <td className={TD_CELL}>
                        <div className="flex justify-center">
                          <StatusBadge active={row.is_active} archived={row.is_archived} />
                        </div>
                      </td>
                      <td className={TD_CELL}>
                        {renderRowActions(row, 'WORK_MODE')}
                      </td>
                    </tr>
                  ))
                ))}
              {activeTab === 'archived' &&
                (currentFilteredRows.length === 0 ? (
                  <AdminTableEmptyState
                    colSpan={COL_SPAN.archived}
                    titleKey={emptyTitleKey}
                    descriptionKey={emptyDescriptionKey}
                  />
                ) : (
                  (paginatedRows as typeof filteredArchivedRows).map((row) => (
                    <tr key={`${row.kind}-${row.id}`} className="hover:bg-[var(--admin-surface-muted)]/50">
                      <td className={TD_CELL}>
                        <span className="academic-archived-type-badge">
                          {t(`${PREFIX}.archived.types.${row.kind}`)}
                        </span>
                      </td>
                      <td className={`${TD_CELL} font-medium`}>{row.name}</td>
                      <td className={`${TD_CELL} font-mono text-xs`}>{row.code || '—'}</td>
                      <td className={TD_CELL}>
                        {[row.context, row.detail].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className={TD_CELL}>
                        <div className="flex justify-center">
                          <StatusBadge active={false} archived />
                        </div>
                      </td>
                      <td className={TD_CELL}>
                        {renderRowActions(
                          { id: row.id, name: row.name, is_archived: true },
                          row.kind,
                          { allowEdit: false, allowDuplicate: false, allowArchive: false },
                        )}
                      </td>
                    </tr>
                  ))
                ))}
            </tbody>
          </AdminTableScroll>
          {currentFilteredRows.length > 0 ? (
            <AdminPagination
              page={tablePage}
              totalPages={tableTotalPages}
              totalItems={tableTotalItems}
              pageSize={TABLE_PAGE_SIZE}
              onPageChange={setTablePage}
              itemLabel={t(`${PREFIX}.tablePaginationLabel`)}
            />
          ) : null}
        </div>
      )}

      <AcademicStructureAuditSection entries={workspace.audit} />

      <EntityFormDialog
        open={formOpen && activeTab !== 'archived'}
        tab={activeTab === 'archived' ? 'tracks' : activeTab}
        mode={formMode}
        editRow={editRow}
        tracks={workspace.tracks}
        levels={workspace.levels}
        classes={workspace.classes}
        internshipTypes={workspace.internshipTypes}
        workModes={workspace.workModes}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <ArchiveImpactDialog
        open={!!archiveTarget}
        label={archiveTarget?.label ?? ''}
        entityType={archiveTarget?.type}
        impact={archiveTarget?.impact ?? null}
        confirming={archiving}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => void confirmArchive()}
      />

      <DeleteImpactDialog
        open={!!deleteTarget}
        label={deleteTarget?.label ?? ''}
        entityType={deleteTarget?.type}
        impact={deleteTarget?.impact ?? null}
        confirming={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </AdminModulePageShell>
  );
};

export default AcademicStructurePage;
