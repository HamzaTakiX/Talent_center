import { ChangeEvent, DragEvent, FunctionComponent, useCallback, useMemo, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  FileSpreadsheet,
  History,
  Loader2,
  Lock,
  RotateCcw,
  Shield,
  Upload,
  AlertTriangle,
  Play,
  Eye,
  Trash2,
} from 'lucide-react';
import AdminModulePageShell from '../../../ui/AdminModulePageShell';
import AdminModal from '../../../ui/AdminModal';
import AdminBackButton from '../../../ui/AdminBackButton';
import AdminPageHero from '../../../ui/AdminPageHero';
import AdminBadge from '../../../ui/AdminBadge';
import AdminEmptyState from '../../../ui/AdminEmptyState';
import AdminCustomSelect, { type AdminSelectOption } from '../../../ui/AdminCustomSelect';
import { AdminFormField, AdminFormInput } from '../../../shared/forms/AdminFormPrimitives';
import { useSrfFinancialImport, type ImportErrorKey } from '../hooks/useSrfFinancialImport';
import type { FinancialImportBatch, ImportMode, ValidationResult } from '../../../api/srfImport';
import type { ImportStep } from '../hooks/useSrfFinancialImport';

const PREFIX = 'admin.modules.srf.importCenter';

const STEPS: ImportStep[] = ['upload', 'mapping', 'preview', 'processing', 'done'];

const PANEL = 'admin-module-panel rounded-2xl p-6 shadow-sm';
const BTN_SECONDARY = 'admin-btn-secondary rounded-lg px-4 py-2 text-sm font-medium';
const BTN_PRIMARY =
  'inline-flex items-center gap-2 rounded-lg bg-[var(--admin-brand)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60';

const statusVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'COMPLETED') return 'success';
  if (status === 'PARTIAL' || status === 'PREVIEW_READY') return 'warning';
  if (status === 'FAILED' || status === 'ROLLED_BACK') return 'danger';
  if (status === 'PROCESSING' || status === 'QUEUED') return 'warning';
  return 'neutral';
};

function resolveError(t: TFunction, error: string, errorKey: ImportErrorKey | null): string {
  if (error) return error;
  if (errorKey) return t(`${PREFIX}.messages.${errorKey}`);
  return '';
}

function batchStatusLabel(t: TFunction, status: string): string {
  const key = `${PREFIX}.batchStatus.${status}`;
  const translated = t(key);
  return translated === key ? status : translated;
}

function fieldLabel(t: TFunction, key: string, fallback: string): string {
  const i18nKey = `${PREFIX}.fields.${key}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? fallback : translated;
}

const ACTIVE_BATCH_STATUSES = new Set(['PROCESSING', 'QUEUED']);

function canDeleteHistoryItem(batch: FinancialImportBatch): boolean {
  return !ACTIVE_BATCH_STATUSES.has(batch.status);
}

function needsForceDeleteHistoryItem(batch: FinancialImportBatch): boolean {
  return (
    (batch.status === 'COMPLETED' || batch.status === 'PARTIAL') &&
    !batch.rolled_back_at &&
    batch.import_mode !== 'DRY_RUN'
  );
}

function buildTargetFieldOptions(
  t: TFunction,
  targetFields: { key: string; label: string; required?: boolean }[],
): AdminSelectOption[] {
  return [
    { value: '', label: `— ${t(`${PREFIX}.ignore`)} —` },
    ...targetFields.map((f) => ({
      value: f.key,
      label: `${fieldLabel(t, f.key, f.label)}${f.required ? ' *' : ''}`,
    })),
  ];
}

const FinancialImportCenterPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const {
    step,
    setStep,
    schema,
    batch,
    headers,
    mapping,
    setMapping,
    importMode,
    setImportMode,
    academicYear,
    setAcademicYear,
    validation,
    history,
    initialLoading,
    historyLoading,
    loading,
    error,
    errorKey,
    handleUpload,
    handlePreview,
    handleExecute,
    handleRollback,
    handleDeleteFromHistory,
    handleClearHistory,
    handleWipeSrfModule,
    resetWorkspace,
    successMessage,
    setSuccessMessage,
  } = useSrfFinancialImport();

  const displayError = resolveError(t, error, errorKey);
  const displaySuccess = (() => {
    if (successMessage.startsWith('rollbackRestored:')) {
      return t(`${PREFIX}.rollbackSuccess`, {
        count: Number(successMessage.split(':')[1]) || 0,
      });
    }
    if (successMessage === 'importPurged') return t(`${PREFIX}.importPurgedSuccess`);
    if (successMessage === 'srfWiped' || successMessage.startsWith('srfWiped:')) {
      const n = successMessage.includes(':') ? Number(successMessage.split(':')[1]) : undefined;
      return t(`${PREFIX}.wipeSrfSuccess`, { count: Number.isFinite(n) ? n : 0 });
    }
    return '';
  })();

  const onFile = useCallback(
    (file: File | null) => {
      if (file) void handleUpload(file);
    },
    [handleUpload],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFile(e.target.files?.[0] ?? null);
    e.target.value = '';
  };

  const stepIndex = STEPS.indexOf(step);
  const workspaceBusy = loading && step !== 'processing' && step !== 'done';

  return (
    <AdminModulePageShell width="wide">
      <AdminBackButton
        onClick={() => navigate('/admin/srf')}
        label={t(`${PREFIX}.backToSrf`)}
        className="mb-4 w-fit"
      />
      <AdminPageHero
        className="mb-6"
        title={t(`${PREFIX}.title`)}
        subtitle={t(`${PREFIX}.subtitle`)}
        badge={
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--admin-brand)]">
            <Shield className="h-4 w-4" aria-hidden />
            {t(`${PREFIX}.secureBadge`)}
          </span>
        }
        action={
          <div className="flex max-w-xs items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-3 text-sm text-[var(--admin-text-secondary)]">
            <Lock className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />
            <span>{t(`${PREFIX}.noPayments`)}</span>
          </div>
        }
      />

      <div className="mt-6 space-y-6">
        <section className="space-y-6" aria-label={t(`${PREFIX}.title`)}>
          {batch ? <StepTimeline current={stepIndex} t={t} /> : null}

          {displaySuccess ? <SuccessBanner message={displaySuccess} /> : null}
          {displayError ? <ErrorBanner message={displayError} /> : null}

          {initialLoading ? (
            <SectionLoading label={t(`${PREFIX}.loadingWorkspace`)} />
          ) : (
            <>
              {step === 'upload' && (
                <UploadSection
                  dragOver={dragOver}
                  loading={loading}
                  disabled={workspaceBusy}
                  importMode={importMode}
                  academicYear={academicYear}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onInputChange={onInputChange}
                  onModeChange={setImportMode}
                  onYearChange={setAcademicYear}
                  t={t}
                />
              )}

              {step === 'mapping' && batch && (
                <MappingSection
                  headers={headers}
                  mapping={mapping}
                  targetFields={schema?.target_fields ?? []}
                  filename={batch.source_filename}
                  rowCount={batch.total_rows}
                  loading={loading}
                  onMappingChange={setMapping}
                  onBack={resetWorkspace}
                  onPreview={() => void handlePreview()}
                  t={t}
                />
              )}

              {step === 'preview' && validation && batch && (
                <PreviewSection
                  validation={validation}
                  importMode={importMode}
                  loading={loading}
                  onBack={() => setStep('mapping')}
                  onExecute={() => void handleExecute()}
                  t={t}
                />
              )}

              {(step === 'processing' || step === 'done') && batch && (
                <ProgressSection
                  batch={batch}
                  loading={loading}
                  onReset={resetWorkspace}
                  onRollback={() =>
                    void handleRollback(batch.uuid, { force: batch.can_retry_rollback })
                  }
                  t={t}
                />
              )}
            </>
          )}
        </section>

        <HistoryPanel
          batches={history}
          loading={historyLoading}
          actionLoading={loading || historyLoading}
          onRollback={(uuid, force) => void handleRollback(uuid, { force })}
          onDelete={(uuid, opts) => void handleDeleteFromHistory(uuid, opts)}
          onClearAll={(opts) => void handleClearHistory(opts)}
          onWipeSrf={(phrase) => void handleWipeSrfModule(phrase)}
          t={t}
        />
      </div>
    </AdminModulePageShell>
  );
};

function SectionLoading({ label }: { label: string }) {
  return (
    <div className={`${PANEL} flex flex-col items-center justify-center gap-3 py-20`} role="status">
      <Loader2 className="h-9 w-9 animate-spin text-[var(--admin-brand)]" aria-hidden />
      <p className="text-sm text-[var(--admin-text-secondary)]">{label}</p>
    </div>
  );
}

function StepTimeline({ current, t }: { current: number; t: TFunction }) {
  const stepKeys = ['upload', 'mapping', 'preview', 'execute', 'done'] as const;
  return (
    <ol className="flex flex-wrap gap-2" aria-label={t(`${PREFIX}.stepsLabel`)}>
      {stepKeys.map((key, i) => {
        const isComplete = i < current;
        const isCurrent = i === current;
        return (
          <li
            key={key}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
              isCurrent
                ? 'bg-[var(--admin-brand)] text-white'
                : isComplete
                  ? 'border border-[var(--admin-brand)]/40 bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]'
                  : 'border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] text-[var(--admin-text-muted)]'
            }`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                isCurrent ? 'bg-white/20' : isComplete ? 'bg-[var(--admin-brand)]/15' : 'bg-[var(--admin-border)]'
              }`}
            >
              {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : i + 1}
            </span>
            {t(`${PREFIX}.steps.${key}`)}
          </li>
        );
      })}
    </ol>
  );
}

function UploadSection({
  dragOver,
  loading,
  disabled,
  importMode,
  academicYear,
  onDragOver,
  onDragLeave,
  onDrop,
  onInputChange,
  onModeChange,
  onYearChange,
  t,
}: {
  dragOver: boolean;
  loading: boolean;
  disabled?: boolean;
  importMode: ImportMode;
  academicYear: string;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onModeChange: (m: ImportMode) => void;
  onYearChange: (y: string) => void;
  t: TFunction;
}) {
  const modes: ImportMode[] = ['CREATE_ONLY', 'UPDATE', 'MERGE', 'DRY_RUN'];
  const modeOptions = useMemo<AdminSelectOption[]>(
    () => modes.map((mode) => ({ value: mode, label: t(`${PREFIX}.modes.${mode}`) })),
    [t],
  );

  return (
    <section className={PANEL}>
      <div className="admin-form mb-4 grid gap-4 sm:grid-cols-2">
        <AdminFormField label={t(`${PREFIX}.academicYear`)} htmlFor="srf-import-year">
          <AdminFormInput
            id="srf-import-year"
            type="text"
            placeholder={t(`${PREFIX}.academicYearPlaceholder`)}
            value={academicYear}
            disabled={disabled || loading}
            onChange={(e) => onYearChange(e.target.value)}
          />
        </AdminFormField>
        <AdminFormField label={t(`${PREFIX}.importMode`)} htmlFor="srf-import-mode">
          <AdminCustomSelect
            id="srf-import-mode"
            variant="default"
            value={importMode}
            options={modeOptions}
            disabled={disabled || loading}
            onChange={(value) => onModeChange(value as ImportMode)}
            aria-label={t(`${PREFIX}.importMode`)}
          />
        </AdminFormField>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 transition-colors ${
          dragOver
            ? 'border-[var(--admin-brand)] bg-[var(--admin-brand-muted)]'
            : 'border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] hover:border-[var(--admin-brand)]'
        } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-[var(--admin-brand)]" />
            <p className="mt-4 text-sm text-[var(--admin-text-secondary)]">{t(`${PREFIX}.loadingWorkspace`)}</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-[var(--admin-brand)]" />
            <p className="mt-4 text-center text-sm font-medium text-[var(--admin-text)]">
              {t(`${PREFIX}.dropzone`)}
            </p>
            <p className="mt-1 text-xs text-[var(--admin-text-secondary)]">{t(`${PREFIX}.fileFormatsHint`)}</p>
          </>
        )}
        <label className={`mt-6 cursor-pointer ${BTN_PRIMARY} ${loading || disabled ? 'pointer-events-none opacity-60' : ''}`}>
          {t(`${PREFIX}.browse`)}
          <input
            type="file"
            accept=".csv,.xlsx,.json"
            className="sr-only"
            disabled={loading || disabled}
            onChange={onInputChange}
          />
        </label>
      </div>
    </section>
  );
}

function MappingSection({
  headers,
  mapping,
  targetFields,
  filename,
  rowCount,
  loading,
  onMappingChange,
  onBack,
  onPreview,
  t,
}: {
  headers: string[];
  mapping: Record<string, string>;
  targetFields: { key: string; label: string; required?: boolean }[];
  filename: string;
  rowCount: number;
  loading: boolean;
  onMappingChange: (m: Record<string, string>) => void;
  onBack: () => void;
  onPreview: () => void;
  t: TFunction;
}) {
  const update = (source: string, target: string) => {
    onMappingChange({ ...mapping, [source]: target });
  };

  const targetOptions = useMemo(
    () => buildTargetFieldOptions(t, targetFields),
    [t, targetFields],
  );

  return (
    <section className={`${PANEL} relative admin-form`}>
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--admin-bg-elevated)]/80 backdrop-blur-[2px]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-brand)]" />
        </div>
      ) : null}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[var(--admin-text-secondary)]">
        <FileSpreadsheet className="h-5 w-5 text-[var(--admin-brand)]" />
        <span className="font-medium text-[var(--admin-text)]">{filename}</span>
        <span>· {t(`${PREFIX}.rowCount`, { count: rowCount })}</span>
      </div>
      <h2 className="admin-module-title text-lg">{t(`${PREFIX}.mappingTitle`)}</h2>
      <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{t(`${PREFIX}.mappingHint`)}</p>
      <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-[var(--admin-border)]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--admin-bg-subtle)] text-left text-xs uppercase text-[var(--admin-text-secondary)]">
            <tr>
              <th className="px-4 py-3">{t(`${PREFIX}.sourceCol`)}</th>
              <th className="px-4 py-3">{t(`${PREFIX}.targetField`)}</th>
            </tr>
          </thead>
          <tbody>
            {headers.map((h, index) => (
              <tr key={h} className="border-t border-[var(--admin-border)]">
                <td className="px-4 py-2.5 font-medium text-[var(--admin-text)]">{h}</td>
                <td className="min-w-[14rem] px-4 py-2.5">
                  <AdminCustomSelect
                    id={`srf-import-map-${index}`}
                    variant="default"
                    value={mapping[h] ?? ''}
                    options={targetOptions}
                    disabled={loading}
                    searchable={targetFields.length > 6}
                    onChange={(value) => update(h, value)}
                    aria-label={`${t(`${PREFIX}.targetField`)} — ${h}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={onBack} disabled={loading} className={BTN_SECONDARY}>
          {t(`${PREFIX}.back`)}
        </button>
        <button type="button" disabled={loading} onClick={onPreview} className={BTN_PRIMARY}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          {t(`${PREFIX}.runValidation`)}
        </button>
      </div>
    </section>
  );
}

function PreviewSection({
  validation,
  importMode,
  loading,
  onBack,
  onExecute,
  t,
}: {
  validation: ValidationResult;
  importMode: ImportMode;
  loading: boolean;
  onBack: () => void;
  onExecute: () => void;
  t: TFunction;
}) {
  const { summary, preview_sample } = validation;
  const isDryRun = importMode === 'DRY_RUN';
  const validRows = summary?.valid_rows ?? 0;
  const errorRows = summary?.error_rows ?? 0;
  const canExecute = validRows > 0;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t(`${PREFIX}.kpi.totalRows`)} value={summary.total_rows} />
        <StatCard label={t(`${PREFIX}.kpi.valid`)} value={summary.valid_rows} tone="success" />
        <StatCard label={t(`${PREFIX}.kpi.errors`)} value={summary.error_rows} tone="danger" />
        <StatCard label={t(`${PREFIX}.kpi.warnings`)} value={summary.warning_rows} tone="warning" />
      </div>

      {!canExecute ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-[color-mix(in_srgb,#f59e0b_12%,var(--admin-bg-elevated))] p-4 text-sm text-[var(--admin-text)]">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {t(`${PREFIX}.noValidRows`)}
        </div>
      ) : errorRows > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] p-4 text-sm text-[var(--admin-text-secondary)]">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          {t(`${PREFIX}.partialImportHint`, { valid: validRows, errors: errorRows })}
        </div>
      ) : null}

      <div className={`${PANEL} relative`}>
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--admin-bg-elevated)]/80 backdrop-blur-[2px]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-brand)]" />
          </div>
        ) : null}
        <h2 className="admin-module-title text-lg">{t(`${PREFIX}.previewTitle`)}</h2>
        <p className="text-sm text-[var(--admin-text-secondary)]">
          {summary.affected_students} {t(`${PREFIX}.studentsAffected`)}
          {summary.conflict_rows > 0 ? ` · ${t(`${PREFIX}.conflicts`, { count: summary.conflict_rows })}` : ''}
        </p>
        <div className="mt-4 overflow-auto rounded-lg border border-[var(--admin-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--admin-bg-subtle)] text-left text-xs text-[var(--admin-text-secondary)]">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">{t(`${PREFIX}.table.student`)}</th>
                <th className="px-3 py-2">{t(`${PREFIX}.table.status`)}</th>
                <th className="px-3 py-2">{t(`${PREFIX}.table.issues`)}</th>
              </tr>
            </thead>
            <tbody>
              {preview_sample.map((row) => (
                <tr key={row.row_number} className="border-t border-[var(--admin-border)]">
                  <td className="px-3 py-2 text-[var(--admin-text)]">{row.row_number}</td>
                  <td className="px-3 py-2 text-[var(--admin-text)]">
                    {row.student_name || row.student_key || '—'}
                  </td>
                  <td className="px-3 py-2">
                    {row.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-[var(--admin-text-secondary)]">
                    {[...row.errors, ...row.warnings].join(' · ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onBack} disabled={loading} className={BTN_SECONDARY}>
            {t(`${PREFIX}.back`)}
          </button>
          <button type="button" disabled={!canExecute || loading} onClick={onExecute} className={BTN_PRIMARY}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isDryRun ? t(`${PREFIX}.runDryRun`) : t(`${PREFIX}.applyImport`)}
          </button>
        </div>
      </div>
    </section>
  );
}

function ProgressSection({
  batch,
  loading,
  onReset,
  onRollback,
  t,
}: {
  batch: FinancialImportBatch;
  loading: boolean;
  onReset: () => void;
  onRollback: () => void;
  t: TFunction;
}) {
  const done = ['COMPLETED', 'PARTIAL', 'FAILED', 'ROLLED_BACK'].includes(batch.status);
  const processing = batch.status === 'PROCESSING' || batch.status === 'QUEUED';

  return (
    <section className={PANEL}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="admin-module-title text-lg">{batch.source_filename}</h2>
        <AdminBadge variant={statusVariant(batch.status)}>
          {batchStatusLabel(t, batch.status)}
        </AdminBadge>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-sm text-[var(--admin-text-secondary)]">
          <span className="flex items-center gap-2">
            {processing ? <Loader2 className="h-4 w-4 animate-spin text-[var(--admin-brand)]" /> : null}
            {batch.progress_message || batchStatusLabel(t, batch.status)}
          </span>
          <span>{batch.progress_percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--admin-bg-subtle)]">
          <div
            className="h-full rounded-full bg-[var(--admin-brand)] transition-all duration-500"
            style={{ width: `${batch.progress_percent}%` }}
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 text-center text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] p-3">
          <div className="font-bold text-[var(--admin-text)]">{batch.success_rows}</div>
          <div className="text-[var(--admin-text-secondary)]">{t(`${PREFIX}.kpi.success`)}</div>
        </div>
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] p-3">
          <div className="font-bold text-[var(--admin-text)]">{batch.error_rows}</div>
          <div className="text-[var(--admin-text-secondary)]">{t(`${PREFIX}.kpi.errors`)}</div>
        </div>
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] p-3">
          <div className="font-bold text-[var(--admin-text)]">{batch.affected_students}</div>
          <div className="text-[var(--admin-text-secondary)]">{t(`${PREFIX}.kpi.affected`)}</div>
        </div>
      </div>
      {done && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onReset} className={BTN_SECONDARY}>
            {t(`${PREFIX}.newImport`)}
          </button>
          {(batch.can_rollback || batch.can_retry_rollback) && (
            <button
              type="button"
              disabled={loading}
              onClick={onRollback}
              className="inline-flex items-center gap-2 rounded-lg admin-btn-secondary border-red-500/40 !text-red-400 hover:!bg-red-500/10"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              {batch.can_retry_rollback
                ? t(`${PREFIX}.retryRollback`)
                : t(`${PREFIX}.rollback`)}
            </button>
          )}
        </div>
      )}
      {processing && !done ? (
        <p className="mt-4 text-sm text-[var(--admin-text-secondary)]">{t(`${PREFIX}.processingImport`)}</p>
      ) : null}
    </section>
  );
}

const WIPE_SRF_CONFIRM_PHRASE = 'VIDER_SRF';

function HistoryPanel({
  batches,
  loading,
  actionLoading,
  onRollback,
  onDelete,
  onClearAll,
  onWipeSrf,
  t,
}: {
  batches: FinancialImportBatch[];
  loading: boolean;
  actionLoading: boolean;
  onRollback: (uuid: string, force?: boolean) => void;
  onDelete: (uuid: string, opts: { force?: boolean; purgeFinancial?: boolean }) => void;
  onClearAll: (opts: { force?: boolean; purgeFinancial?: boolean }) => void;
  onWipeSrf: (confirmPhrase: string) => void;
  t: TFunction;
}) {
  const [pendingDelete, setPendingDelete] = useState<FinancialImportBatch | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [wipeSrfOpen, setWipeSrfOpen] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [purgeFinancial, setPurgeFinancial] = useState(true);
  const [wipeConfirmInput, setWipeConfirmInput] = useState('');

  const deletableCount = batches.filter(canDeleteHistoryItem).length;
  const hasForceCandidates = batches.some(
    (b) => canDeleteHistoryItem(b) && needsForceDeleteHistoryItem(b),
  );
  const oneNeedsForce = pendingDelete !== null && needsForceDeleteHistoryItem(pendingDelete);
  const canConfirmOne = !oneNeedsForce || forceDelete || purgeFinancial;

  const closeDeleteModal = () => {
    setPendingDelete(null);
    setForceDelete(false);
    setPurgeFinancial(true);
  };

  const closeClearAllModal = () => {
    setClearAllOpen(false);
    setForceDelete(false);
    setPurgeFinancial(true);
  };

  const closeWipeSrfModal = () => {
    setWipeSrfOpen(false);
    setWipeConfirmInput('');
  };

  const openDeleteModal = (batch: FinancialImportBatch) => {
    setForceDelete(false);
    setPurgeFinancial(needsForceDeleteHistoryItem(batch));
    setPendingDelete(batch);
  };

  return (
    <section className={PANEL} aria-labelledby="srf-import-history-title">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <History className="h-5 w-5 text-[var(--admin-brand)]" aria-hidden />
        <h2 id="srf-import-history-title" className="admin-module-title text-lg">
          {t(`${PREFIX}.history`)}
        </h2>
        <div className="ms-auto flex items-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-[var(--admin-brand)]" /> : null}
          {!loading && batches.length > 0 ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => {
                setWipeConfirmInput('');
                setWipeSrfOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/15 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              {t(`${PREFIX}.wipeSrfModule`)}
            </button>
          ) : null}
          {batches.length > 0 && deletableCount > 0 ? (
            <button
              type="button"
              disabled={actionLoading || loading}
              onClick={() => {
                setForceDelete(false);
                setPurgeFinancial(true);
                setClearAllOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-text-secondary)] transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              {t(`${PREFIX}.clearHistory`)}
            </button>
          ) : null}
        </div>
      </div>
      <p className="mb-4 text-sm text-[var(--admin-text-secondary)]">{t(`${PREFIX}.historySubtitle`)}</p>

      {loading ? (
        <HistorySkeleton />
      ) : batches.length === 0 ? (
        <AdminEmptyState
          title={t(`${PREFIX}.noHistoryTitle`)}
          description={t(`${PREFIX}.noHistoryDescription`)}
          icon={
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-brand-muted)] shadow-inner">
              <History className="h-7 w-7 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
            </div>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {batches.slice(0, 24).map((b) => (
            <li
              key={b.uuid}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] p-4 text-sm transition-colors hover:border-[var(--admin-brand-muted)]"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 flex-1 truncate font-medium text-[var(--admin-text)]">
                  {b.source_filename}
                </span>
                <AdminBadge variant={statusVariant(b.status)}>{batchStatusLabel(t, b.status)}</AdminBadge>
              </div>
              <p className="mt-2 text-xs text-[var(--admin-text-secondary)]">
                {b.success_rows}/{b.total_rows} · {b.started_by_name || '—'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {b.can_rollback || b.can_retry_rollback ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onRollback(b.uuid, b.can_retry_rollback)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 hover:underline disabled:opacity-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {b.can_retry_rollback
                      ? t(`${PREFIX}.retryRollback`)
                      : t(`${PREFIX}.rollback`)}
                  </button>
                ) : null}
                {canDeleteHistoryItem(b) ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => openDeleteModal(b)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:underline disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    {t(`${PREFIX}.removeFromHistory`)}
                  </button>
                ) : (
                  <span className="text-xs text-[var(--admin-text-muted)]">
                    {t(`${PREFIX}.cannotDeleteActive`)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <AdminModal
        open={pendingDelete !== null}
        onClose={closeDeleteModal}
        title={t(`${PREFIX}.clearHistoryOneTitle`)}
        description={t(`${PREFIX}.clearHistoryOneDescription`)}
        maxWidthClass="max-w-md"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={BTN_SECONDARY} onClick={closeDeleteModal}>
              {t(`${PREFIX}.cancel`)}
            </button>
            <button
              type="button"
              disabled={actionLoading || !canConfirmOne}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              onClick={() => {
                if (!pendingDelete) return;
                onDelete(pendingDelete.uuid, {
                  force: oneNeedsForce ? forceDelete : undefined,
                  purgeFinancial,
                });
                closeDeleteModal();
              }}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {t(`${PREFIX}.confirmClear`)}
            </button>
          </div>
        }
      >
        {oneNeedsForce ? (
          <label className="flex cursor-pointer gap-3 rounded-xl border border-emerald-500/30 bg-[color-mix(in_srgb,#10b981_10%,var(--admin-bg-elevated))] p-3 text-sm text-[var(--admin-text)]">
            <input
              type="checkbox"
              className="admin-form-checkbox mt-0.5"
              checked={purgeFinancial}
              onChange={(e) => setPurgeFinancial(e.target.checked)}
            />
            <span>
              <span className="font-medium">{t(`${PREFIX}.purgeFinancialLabel`)}</span>
              <span className="mt-1 block text-xs text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.purgeFinancialHint`)}
              </span>
            </span>
          </label>
        ) : null}
        {oneNeedsForce && !purgeFinancial ? (
          <label className="mt-3 flex cursor-pointer gap-3 rounded-xl border border-amber-500/30 bg-[color-mix(in_srgb,#f59e0b_10%,var(--admin-bg-elevated))] p-3 text-sm text-[var(--admin-text)]">
            <input
              type="checkbox"
              className="admin-form-checkbox mt-0.5"
              checked={forceDelete}
              onChange={(e) => setForceDelete(e.target.checked)}
            />
            <span>
              <span className="font-medium">{t(`${PREFIX}.clearHistoryForceLabel`)}</span>
              <span className="mt-1 block text-xs text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.clearHistoryForceHint`)}
              </span>
            </span>
          </label>
        ) : null}
        {pendingDelete ? (
          <p className="mt-3 text-sm font-medium text-[var(--admin-text)]">{pendingDelete.source_filename}</p>
        ) : null}
      </AdminModal>

      <AdminModal
        open={clearAllOpen}
        onClose={closeClearAllModal}
        title={t(`${PREFIX}.clearHistoryAllTitle`)}
        description={t(`${PREFIX}.clearHistoryAllDescription`)}
        maxWidthClass="max-w-md"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={BTN_SECONDARY} onClick={closeClearAllModal}>
              {t(`${PREFIX}.cancel`)}
            </button>
            <button
              type="button"
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              onClick={() => {
                onClearAll({
                  force: hasForceCandidates ? forceDelete : undefined,
                  purgeFinancial,
                });
                closeClearAllModal();
              }}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {t(`${PREFIX}.confirmClear`)}
            </button>
          </div>
        }
      >
        {hasForceCandidates ? (
          <label className="flex cursor-pointer gap-3 rounded-xl border border-emerald-500/30 bg-[color-mix(in_srgb,#10b981_10%,var(--admin-bg-elevated))] p-3 text-sm text-[var(--admin-text)]">
            <input
              type="checkbox"
              className="admin-form-checkbox mt-0.5"
              checked={purgeFinancial}
              onChange={(e) => setPurgeFinancial(e.target.checked)}
            />
            <span>
              <span className="font-medium">{t(`${PREFIX}.purgeFinancialAllLabel`)}</span>
              <span className="mt-1 block text-xs text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.purgeFinancialAllHint`)}
              </span>
            </span>
          </label>
        ) : null}
        {hasForceCandidates && !purgeFinancial ? (
          <label className="mt-3 flex cursor-pointer gap-3 rounded-xl border border-amber-500/30 bg-[color-mix(in_srgb,#f59e0b_10%,var(--admin-bg-elevated))] p-3 text-sm text-[var(--admin-text)]">
            <input
              type="checkbox"
              className="admin-form-checkbox mt-0.5"
              checked={forceDelete}
              onChange={(e) => setForceDelete(e.target.checked)}
            />
            <span>
              <span className="font-medium">{t(`${PREFIX}.clearHistoryForceLabel`)}</span>
              <span className="mt-1 block text-xs text-[var(--admin-text-secondary)]">
                {t(`${PREFIX}.clearHistoryForceHint`)}
              </span>
            </span>
          </label>
        ) : null}
        <p className="mt-3 text-xs text-[var(--admin-text-secondary)]">
          {deletableCount} / {batches.length}
        </p>
      </AdminModal>

      <AdminModal
        open={wipeSrfOpen}
        onClose={closeWipeSrfModal}
        title={t(`${PREFIX}.wipeSrfTitle`)}
        description={t(`${PREFIX}.wipeSrfDescription`)}
        maxWidthClass="max-w-md"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={BTN_SECONDARY} onClick={closeWipeSrfModal}>
              {t(`${PREFIX}.cancel`)}
            </button>
            <button
              type="button"
              disabled={actionLoading || wipeConfirmInput.trim() !== WIPE_SRF_CONFIRM_PHRASE}
              className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
              onClick={() => {
                onWipeSrf(wipeConfirmInput.trim());
                closeWipeSrfModal();
              }}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {t(`${PREFIX}.confirmWipeSrf`)}
            </button>
          </div>
        }
      >
        <label className="block text-sm text-[var(--admin-text-secondary)]">
          {t(`${PREFIX}.wipeSrfConfirmLabel`, { phrase: WIPE_SRF_CONFIRM_PHRASE })}
          <input
            type="text"
            className="admin-form-input mt-2 w-full font-mono"
            value={wipeConfirmInput}
            onChange={(e) => setWipeConfirmInput(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      </AdminModal>
    </section>
  );
}

function HistorySkeleton() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {[1, 2, 3].map((i) => (
        <li key={i} className="admin-shimmer h-24 rounded-xl" />
      ))}
    </ul>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'success' | 'danger' | 'warning';
}) {
  const bg =
    tone === 'success'
      ? 'border border-[var(--admin-border)] bg-[color-mix(in_srgb,#10b981_14%,var(--admin-bg-elevated))] text-[var(--admin-text)]'
      : tone === 'danger'
        ? 'border border-[var(--admin-border)] bg-[color-mix(in_srgb,#ef4444_14%,var(--admin-bg-elevated))] text-[var(--admin-text)]'
        : tone === 'warning'
          ? 'border border-[var(--admin-border)] bg-[color-mix(in_srgb,#f59e0b_14%,var(--admin-bg-elevated))] text-[var(--admin-text)]'
          : 'border border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-brand)_14%,var(--admin-bg-elevated))] text-[var(--admin-text)]';
  return (
    <div className={`rounded-xl p-4 ${bg}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-[color-mix(in_srgb,#ef4444_12%,var(--admin-bg-elevated))] px-4 py-3 text-sm text-[var(--admin-text)]">
      {message}
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-[color-mix(in_srgb,#10b981_12%,var(--admin-bg-elevated))] px-4 py-3 text-sm text-[var(--admin-text)]">
      {message}
    </div>
  );
}

export default FinancialImportCenterPage;
