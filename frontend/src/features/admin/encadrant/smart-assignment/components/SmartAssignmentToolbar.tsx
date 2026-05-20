import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Play, RefreshCw, Sparkles } from 'lucide-react';
import type { AcademicYearOption } from '../../../api/types';
import AdminFormSwitch from '../../../shared/forms/AdminFormSwitch';
import AdminCustomSelect from '../../../ui/AdminCustomSelect';

interface SmartAssignmentToolbarProps {
  academicYear: string;
  academicYears: AcademicYearOption[];
  onAcademicYearChange: (year: string) => void;
  onPreview: () => void;
  onRun: () => void;
  onRefresh: () => void;
  loading: boolean;
  respectLocks: boolean;
  onRespectLocksChange: (value: boolean) => void;
  phaseLabel?: string | null;
}

const SmartAssignmentToolbar: FunctionComponent<SmartAssignmentToolbarProps> = ({
  academicYear,
  academicYears,
  onAcademicYearChange,
  onPreview,
  onRun,
  onRefresh,
  loading,
  respectLocks,
  onRespectLocksChange,
}) => {
  const { t } = useTranslation();

  const yearOptions = useMemo(
    () =>
      academicYears.map((y) => ({
        value: y.code,
        label: `${y.label || y.code}${y.is_current ? ` (${t('admin.smartAssignment.currentYear')})` : ''}`,
      })),
    [academicYears, t],
  );

  const Panel = 'div';

  return (
    <Panel className="admin-module-panel rounded-xl p-4 shadow-sm">
      <Panel
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        role="toolbar"
        aria-label={t('admin.smartAssignment.title')}
      >
        <Panel className="flex min-w-[min(100%,280px)] shrink-0 flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--admin-text-muted)]">
            {t('admin.smartAssignment.academicYear')}
          </span>
          <Panel className="admin-select-wrap w-full min-w-[220px]">
            <AdminCustomSelect
              variant="default"
              value={academicYear}
              options={yearOptions}
              onChange={onAcademicYearChange}
              disabled={loading || yearOptions.length === 0}
              aria-label={t('admin.smartAssignment.academicYear')}
              className="w-full"
            />
          </Panel>
        </Panel>

        <Panel className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-3 gap-y-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="admin-module-toolbar__btn inline-flex h-[2.75rem] items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            {t('admin.smartAssignment.refresh')}
          </button>
          <button
            type="button"
            onClick={onPreview}
            disabled={loading}
            className="inline-flex h-[2.75rem] items-center gap-2 rounded-lg border border-[var(--admin-brand)] px-3 text-sm font-medium text-[var(--admin-brand)] hover:bg-[var(--admin-brand-muted)] disabled:opacity-50"
          >
            <Eye className="h-4 w-4" aria-hidden />
            {t('admin.smartAssignment.preview')}
          </button>
          <button
            type="button"
            onClick={onRun}
            disabled={loading}
            className="inline-flex h-[2.75rem] items-center gap-2 rounded-lg bg-[var(--admin-brand)] px-4 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-4 w-4" aria-hidden />
            {t('admin.smartAssignment.runEngine')}
          </button>
          <AdminFormSwitch
            id="smart-assignment-respect-locks"
            layout="inline"
            label={t('admin.smartAssignment.respectLocks')}
            checked={respectLocks}
            onChange={onRespectLocksChange}
            disabled={loading}
            className="h-[2.75rem] shrink-0"
          />
          <Panel
            className="hidden h-8 w-px shrink-0 bg-[var(--admin-border)] sm:block"
            aria-hidden
          />
          <Panel className="flex min-w-0 max-w-sm items-center gap-2 text-xs text-[var(--admin-text-muted)]">
            <Sparkles className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />
            <span className="leading-snug">{t('admin.smartAssignment.engineHint')}</span>
          </Panel>
        </Panel>
      </Panel>
    </Panel>
  );
};

export default SmartAssignmentToolbar;
