import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdminBackLabel } from '../../../i18n/useAdminCopy';
import AdminBackButton from '../../../ui/AdminBackButton';
import AdminModulePageShell from '../../../ui/AdminModulePageShell';
import SmartAssignmentPageHero from '../components/SmartAssignmentPageHero';
import { academicReferenceApi } from '../../../api/reference';
import {
  SmartAssignmentPrecheckError,
  smartAssignmentApi,
} from '../../../api/smartAssignment';
import type {
  AcademicYearOption,
  SmartAssignmentAssignmentStrategy,
  SmartAssignmentPrecheckResult,
  SmartAssignmentResultsPayload,
  SmartAssignmentRunPayload,
  SmartAssignmentStudentRow,
  SmartAssignmentEncadrantCard,
} from '../../../api/types';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import SmartAssignmentStatsBar from '../components/SmartAssignmentStatsBar';
import SmartAssignmentToolbar from '../components/SmartAssignmentToolbar';
import SmartAssignmentWorkloadChart from '../components/SmartAssignmentWorkloadChart';
import SmartAssignmentInternshipAnalyticsPanel from '../components/SmartAssignmentInternshipAnalytics';
import SmartAssignmentUncoveredTypesPanel from '../components/SmartAssignmentUncoveredTypesPanel';
import EncadrantsAssignmentGrid from '../components/EncadrantsAssignmentGrid';
import SmartAssignmentValidationBanner from '../components/validation/SmartAssignmentValidationBanner';
import SmartAssignmentValidationDetailsModal from '../components/validation/SmartAssignmentValidationDetailsModal';
import SmartAssignmentRunConfirmModal from '../components/validation/SmartAssignmentRunConfirmModal';
import SmartAssignmentManualAssignModal from '../components/SmartAssignmentManualAssignModal';
import {
  buildEncadrantAssignmentMap,
  collectEligibleStudents,
} from '../utils/manualAssignUtils';

type RunPhase = 'idle' | 'validating' | 'running' | 'previewing';

const emptyStats = {
  total_eligible_students: 0,
  total_assigned: 0,
  unassigned_count: 0,
  overloaded_encadrants: 0,
  available_supervisors: 0,
};

const SmartAssignmentPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('encadrants');
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useAdminToast();
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [academicYear, setAcademicYear] = useState('');
  const [data, setData] = useState<SmartAssignmentResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [runPhase, setRunPhase] = useState<RunPhase>('idle');
  const [precheck, setPrecheck] = useState<SmartAssignmentPrecheckResult | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDryRun, setPendingDryRun] = useState(false);
  const [excludedEncadrants, setExcludedEncadrants] = useState<Set<number>>(new Set());
  const [excludedStudents] = useState<Set<number>>(new Set());
  const [respectLocks, setRespectLocks] = useState(true);
  const [activeDragStudent, setActiveDragStudent] = useState<SmartAssignmentStudentRow | null>(null);
  const [manualAssignEncadrant, setManualAssignEncadrant] = useState<SmartAssignmentEncadrantCard | null>(
    null,
  );
  const [assigningStudentId, setAssigningStudentId] = useState<number | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const basePayload = useCallback(
    (): SmartAssignmentRunPayload => ({
      academic_year: academicYear,
      excluded_encadrant_ids: Array.from(excludedEncadrants),
      excluded_student_ids: Array.from(excludedStudents),
      respect_locks: respectLocks,
    }),
    [academicYear, excludedEncadrants, excludedStudents, respectLocks],
  );

  const loadYears = useCallback(async () => {
    const years = (await academicReferenceApi.listAcademicYears({
      structured: true,
    })) as AcademicYearOption[];
    setAcademicYears(years);
    const current = years.find((y) => y.is_current) ?? years[0];
    if (current) setAcademicYear(current.code);
  }, []);

  const loadResults = useCallback(async () => {
    if (!academicYear) return;
    setLoading(true);
    try {
      const result = await smartAssignmentApi.getResults(academicYear);
      setData(result);
    } catch {
      setData(null);
      toastError(t('admin.smartAssignment.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [academicYear, t, toastError]);

  useEffect(() => {
    void loadYears();
  }, [loadYears]);

  useEffect(() => {
    if (academicYear) void loadResults();
  }, [academicYear, loadResults]);

  useEffect(() => {
    setPrecheck(null);
  }, [academicYear, excludedEncadrants, respectLocks]);

  const executeEngine = useCallback(
    async (dryRun: boolean, strategy: SmartAssignmentAssignmentStrategy = 'full') => {
      setRunPhase(dryRun ? 'previewing' : 'running');
      try {
        const payload: SmartAssignmentRunPayload = {
          ...basePayload(),
          assignment_strategy: strategy,
          confirm_warnings: true,
        };
        const result = dryRun
          ? await smartAssignmentApi.preview(payload)
          : await smartAssignmentApi.run(payload);
        await loadResults();
        setPrecheck(null);
        if (!dryRun) {
          toastSuccess(t('admin.smartAssignment.success.applied'));
        } else {
          toastSuccess(
            t('admin.smartAssignment.success.preview', {
              changes: result.stats.applied_changes ?? 0,
            }),
          );
        }
        if (result.runtime_alerts?.length) {
          for (const alert of result.runtime_alerts) {
            toastWarning(
              t(`admin.smartAssignment.validation.runtime.${alert.code}`, {
                count: alert.count,
              }),
            );
          }
        }
      } catch (err) {
        if (err instanceof SmartAssignmentPrecheckError) {
          setPrecheck(err.precheck);
          toastError(t('admin.smartAssignment.validation.blockedToast'));
        } else {
          toastError(t('admin.smartAssignment.errors.engineFailed'));
        }
      } finally {
        setRunPhase('idle');
        setConfirmOpen(false);
      }
    },
    [basePayload, loadResults, t, toastError, toastSuccess, toastWarning],
  );

  const startRunFlow = useCallback(
    async (dryRun: boolean) => {
      if (!academicYear) return;
      setRunPhase('validating');
      setPrecheck(null);
      try {
        const result = await smartAssignmentApi.precheck(basePayload());
        setPrecheck(result);

        if (result.has_blocking_errors) {
          toastError(t('admin.smartAssignment.validation.blockedToast'));
          setRunPhase('idle');
          return;
        }

        if (result.has_warnings) {
          setPendingDryRun(dryRun);
          setConfirmOpen(true);
          setRunPhase('idle');
          return;
        }

        await executeEngine(dryRun, 'full');
      } catch {
        toastError(t('admin.smartAssignment.errors.precheckFailed'));
        setRunPhase('idle');
      }
    },
    [academicYear, basePayload, executeEngine, t, toastError],
  );

  const handleConfirmRun = (strategy: SmartAssignmentAssignmentStrategy) => {
    void executeEngine(pendingDryRun, strategy);
  };

  const reassignStudent = useCallback(
    async (student: SmartAssignmentStudentRow, encadrantProfileId: number | null) => {
      setAssigningStudentId(student.student_profile_id);
      try {
        await smartAssignmentApi.reassign({
          student_profile_id: student.student_profile_id,
          encadrant_profile_id: encadrantProfileId,
          academic_year: academicYear,
        });
        await loadResults();
        toastSuccess(t('admin.smartAssignment.success.reassigned'));
      } catch {
        toastError(t('admin.smartAssignment.errors.reassignFailed'));
      } finally {
        setAssigningStudentId(null);
      }
    },
    [academicYear, loadResults, t, toastError, toastSuccess],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragStudent(null);
      const { active, over } = event;
      if (!over || !active.data.current?.student) return;

      const student = active.data.current.student as SmartAssignmentStudentRow;
      const overId = String(over.id);

      let targetEncadrantId: number | null = null;
      if (overId.startsWith('encadrant-')) {
        targetEncadrantId = parseInt(overId.replace('encadrant-', ''), 10);
      }

      await reassignStudent(student, targetEncadrantId);
    },
    [reassignStudent],
  );

  const handleManualAssign = useCallback(
    (student: SmartAssignmentStudentRow) => {
      if (!manualAssignEncadrant) return;
      void reassignStudent(student, manualAssignEncadrant.encadrant_profile_id);
    },
    [manualAssignEncadrant, reassignStudent],
  );

  const handleManualUnassign = useCallback(
    (student: SmartAssignmentStudentRow) => {
      void reassignStudent(student, null);
    },
    [reassignStudent],
  );

  const handleToggleLock = async (assignmentId: number, locked: boolean) => {
    try {
      await smartAssignmentApi.setLock(assignmentId, locked);
      await loadResults();
    } catch {
      toastError(t('admin.smartAssignment.errors.lockFailed'));
    }
  };

  const toggleExcludeEncadrant = (id: number) => {
    setExcludedEncadrants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const stats = data?.stats ?? emptyStats;
  const isEngineBusy = runPhase !== 'idle';

  const displayEncadrants = useMemo(() => {
    if (!data) return [];
    return data.encadrants;
  }, [data]);

  const eligibleStudents = useMemo(
    () => (data ? collectEligibleStudents(data) : []),
    [data],
  );

  const assignmentMap = useMemo(
    () => (data ? buildEncadrantAssignmentMap(data) : new Map()),
    [data],
  );

  const manualAssignEncadrantLive = useMemo(() => {
    if (!manualAssignEncadrant || !data) return manualAssignEncadrant;
    return (
      data.encadrants.find(
        (enc) => enc.encadrant_profile_id === manualAssignEncadrant.encadrant_profile_id,
      ) ?? manualAssignEncadrant
    );
  }, [data, manualAssignEncadrant]);

  const phaseLabel =
    runPhase === 'validating'
      ? t('admin.smartAssignment.validation.phase.validating')
      : runPhase === 'running'
        ? t('admin.smartAssignment.validation.phase.running')
        : runPhase === 'previewing'
          ? t('admin.smartAssignment.validation.phase.previewing')
          : null;

  return (
    <AdminModulePageShell width="wide">
      <AdminBackButton
        onClick={() => navigate('/admin/encadrants')}
        label={backLabel}
        className="mb-4 w-fit shrink-0 !rounded-lg"
      />

      <SmartAssignmentPageHero />

      <SmartAssignmentUncoveredTypesPanel
        analytics={data?.internship_analytics}
        loading={loading}
      />

      <SmartAssignmentToolbar
        academicYear={academicYear}
        academicYears={academicYears}
        onAcademicYearChange={setAcademicYear}
        onPreview={() => void startRunFlow(true)}
        onRun={() => void startRunFlow(false)}
        onRefresh={() => void loadResults()}
        loading={loading || isEngineBusy}
        respectLocks={respectLocks}
        onRespectLocksChange={setRespectLocks}
        phaseLabel={phaseLabel}
      />

      {phaseLabel ? (
        <div
          className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--admin-brand)]/30 bg-[var(--admin-brand-muted)] px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-brand)]" aria-hidden />
          <p className="text-sm font-medium text-[var(--admin-text)]">{phaseLabel}</p>
        </div>
      ) : null}

      {precheck && (precheck.has_blocking_errors || precheck.has_warnings) ? (
        <SmartAssignmentValidationBanner
          precheck={precheck}
          onViewDetails={() => setDetailsOpen(true)}
        />
      ) : null}

      <div className="mt-6">
        <SmartAssignmentStatsBar stats={stats} />
      </div>

      <div className="mt-6">
        <SmartAssignmentInternshipAnalyticsPanel
          analytics={data?.internship_analytics}
          loading={loading}
          fallbackUniqueEncadrants={data?.stats.available_supervisors}
        />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => {
          const student = e.active.data.current?.student as SmartAssignmentStudentRow | undefined;
          setActiveDragStudent(student ?? null);
        }}
        onDragEnd={(e) => void handleDragEnd(e)}
        onDragCancel={() => setActiveDragStudent(null)}
      >
        <div className="mt-6 space-y-6">
          <EncadrantsAssignmentGrid
            encadrants={displayEncadrants}
            excludedIds={excludedEncadrants}
            loading={loading && !data}
            onToggleExclude={toggleExcludeEncadrant}
            onToggleLock={handleToggleLock}
          />
          <SmartAssignmentWorkloadChart
            encadrants={displayEncadrants}
            excludedIds={excludedEncadrants}
            loading={loading && !data}
            onSelectEncadrant={setManualAssignEncadrant}
          />
        </div>
        <DragOverlay>
          {activeDragStudent ? (
            <div className="rounded-lg border border-[var(--admin-brand)] bg-[var(--admin-surface)] p-2 shadow-lg opacity-95">
              <p className="text-sm font-medium">{activeDragStudent.full_name}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <SmartAssignmentValidationDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        precheck={precheck}
      />
      <SmartAssignmentRunConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        precheck={precheck}
        isPreview={pendingDryRun}
        loading={isEngineBusy}
        onConfirm={handleConfirmRun}
      />

      <SmartAssignmentManualAssignModal
        open={manualAssignEncadrant !== null}
        encadrant={manualAssignEncadrantLive}
        students={eligibleStudents}
        assignmentMap={assignmentMap}
        assigningId={assigningStudentId}
        onClose={() => setManualAssignEncadrant(null)}
        onAssign={handleManualAssign}
        onUnassign={handleManualUnassign}
      />
    </AdminModulePageShell>
  );
};

export default SmartAssignmentPage;
