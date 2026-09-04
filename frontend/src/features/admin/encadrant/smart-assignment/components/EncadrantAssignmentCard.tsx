import { FunctionComponent, useEffect, useId, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentEncadrantCard } from '../../../api/types';
import { specializationDomainLabel } from '../../utils/specializationDomainDisplay';
import AdminFormSwitch from '../../../shared/forms/AdminFormSwitch';
import SmartAssignmentStudentRow from './SmartAssignmentStudentRow';
import { getEncadrantLoadBarColor } from '../utils/workloadBarUtils';

interface EncadrantAssignmentCardProps {
  encadrant: SmartAssignmentEncadrantCard;
  excluded: boolean;
  onToggleExclude: (encadrantProfileId: number) => void;
  onToggleLock?: (assignmentId: number, locked: boolean) => void;
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

const EncadrantAssignmentCard: FunctionComponent<EncadrantAssignmentCardProps> = ({
  encadrant,
  excluded,
  onToggleExclude,
  onToggleLock,
}) => {
  const { t } = useTranslation();
  const studentsPanelId = useId();
  const [studentsExpanded, setStudentsExpanded] = useState(false);
  const studentCount = encadrant.students.length;

  const dropId = `encadrant-${encadrant.encadrant_profile_id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: { encadrantProfileId: encadrant.encadrant_profile_id },
  });

  useEffect(() => {
    if (isOver) setStudentsExpanded(true);
  }, [isOver]);

  const loadPct = Math.min(100, encadrant.load_percent);
  const barColor = getEncadrantLoadBarColor({
    loadPct,
    isOverloaded: encadrant.is_overloaded,
    currentLoad: encadrant.current_load,
    maxCapacity: encadrant.max_capacity,
  });

  return (
    <article
      className={`flex flex-col rounded-xl border bg-[var(--admin-surface-inset)] shadow-sm transition-all ${
        excluded
          ? 'border-dashed border-[var(--admin-border)] opacity-50'
          : 'border-[var(--admin-border)]'
      } ${isOver ? 'ring-2 ring-[var(--admin-brand)]' : ''}`}
    >
      <header className={`p-4 ${studentsExpanded ? 'border-b border-[var(--admin-border)]' : ''}`}>
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--admin-brand), #6366f1)' }}
            aria-hidden
          >
            {getInitials(encadrant.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-[var(--admin-text)]">
              {encadrant.full_name}
            </h3>
            <p className="truncate text-xs text-[var(--admin-text-muted)]">{encadrant.email}</p>
          </div>
          <AdminFormSwitch
            id={`smart-assignment-exclude-${encadrant.encadrant_profile_id}`}
            layout="inline"
            label={t('admin.smartAssignment.exclude')}
            checked={excluded}
            onChange={() => onToggleExclude(encadrant.encadrant_profile_id)}
            className="shrink-0 px-0 py-0 hover:bg-transparent"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {encadrant.specialization_domains.map((d) => {
            const key = typeof d === 'string' ? d : d.code;
            return (
              <span
                key={key}
                className="rounded-full bg-[var(--admin-brand-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--admin-brand)]"
              >
                {specializationDomainLabel(d, t)}
              </span>
            );
          })}
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-[var(--admin-text-muted)]">
            <span>
              {t('admin.smartAssignment.workload', {
                current: encadrant.current_load,
                max: encadrant.max_capacity || '∞',
              })}
            </span>
            <span>{loadPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--admin-border)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${loadPct}%`, background: barColor }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setStudentsExpanded((open) => !open)}
          aria-expanded={studentsExpanded}
          aria-controls={studentsPanelId}
          className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-3 py-2 text-start text-xs font-medium text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-row-hover)]"
        >
          <span>
            {studentsExpanded
              ? t('admin.smartAssignment.encadrants.collapseStudents')
              : t('admin.smartAssignment.encadrants.expandStudents', { count: studentCount })}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[var(--admin-brand)] transition-transform duration-200 ${
              studentsExpanded ? 'rotate-180' : ''
            }`}
            aria-hidden
          />
        </button>
      </header>

      {studentsExpanded ? (
        <div
          id={studentsPanelId}
          ref={setNodeRef}
          className="flex max-h-72 flex-col gap-2 overflow-y-auto p-3"
        >
          {studentCount === 0 ? (
            <p className="py-6 text-center text-xs text-[var(--admin-text-muted)]">
              {t('admin.smartAssignment.dropStudentsHere')}
            </p>
          ) : (
            encadrant.students.map((s) => (
              <SmartAssignmentStudentRow
                key={s.student_profile_id}
                student={s}
                onToggleLock={onToggleLock}
              />
            ))
          )}
        </div>
      ) : null}
    </article>
  );
};

export default EncadrantAssignmentCard;