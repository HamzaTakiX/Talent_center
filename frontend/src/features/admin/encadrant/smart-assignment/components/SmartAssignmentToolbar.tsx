import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Eye, Play, RefreshCw } from 'lucide-react';
import type { AcademicYearOption } from '../../../api/types';
import AdminFormSwitch from '../../../shared/forms/AdminFormSwitch';
import AdminCustomSelect from '../../../ui/AdminCustomSelect';
import '../styles/admin-smart-assignment-toolbar.css';

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

  return (
    <section className="sa-toolbar" aria-label={t('admin.smartAssignment.title')}>
      <div className="sa-toolbar__inner" role="toolbar">
        <div className="sa-toolbar__year">
          <span className="sa-toolbar__year-label">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {t('admin.smartAssignment.academicYear')}
          </span>
          <div className="sa-toolbar__year-select">
            <AdminCustomSelect
              variant="default"
              value={academicYear}
              options={yearOptions}
              onChange={onAcademicYearChange}
              disabled={loading || yearOptions.length === 0}
              aria-label={t('admin.smartAssignment.academicYear')}
              className="w-full"
            />
          </div>
        </div>

        <div className="sa-toolbar__actions">
          <div className="sa-toolbar__btn-group">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="sa-toolbar__btn sa-toolbar__btn--ghost"
            >
              <RefreshCw className={`h-4 w-4 shrink-0 ${loading ? 'animate-spin' : ''}`} aria-hidden />
              {t('admin.smartAssignment.refresh')}
            </button>
            <button
              type="button"
              onClick={onPreview}
              disabled={loading}
              className="sa-toolbar__btn sa-toolbar__btn--outline"
            >
              <Eye className="h-4 w-4 shrink-0" aria-hidden />
              {t('admin.smartAssignment.preview')}
            </button>
            <button
              type="button"
              onClick={onRun}
              disabled={loading}
              className="sa-toolbar__btn sa-toolbar__btn--primary"
            >
              <Play className="h-4 w-4 shrink-0" aria-hidden />
              {t('admin.smartAssignment.runEngine')}
            </button>
          </div>

          <div className="sa-toolbar__toggle">
            <AdminFormSwitch
              id="smart-assignment-respect-locks"
              layout="inline"
              label={t('admin.smartAssignment.respectLocks')}
              checked={respectLocks}
              onChange={onRespectLocksChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartAssignmentToolbar;
