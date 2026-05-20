import { CSSProperties, FunctionComponent } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Lock, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentStudentRow as StudentRowType } from '../../../api/types';

interface SmartAssignmentStudentRowProps {
  student: StudentRowType;
  onToggleLock?: (assignmentId: number, locked: boolean) => void;
}

const SmartAssignmentStudentRow: FunctionComponent<SmartAssignmentStudentRowProps> = ({
  student,
  onToggleLock,
}) => {
  const { t } = useTranslation();
  const dragId = `student-${student.student_profile_id}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: { student },
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-2 py-2 text-start shadow-sm transition-shadow hover:shadow-md"
    >
      <button
        type="button"
        className="mt-0.5 shrink-0 cursor-grab text-[var(--admin-text-muted)] active:cursor-grabbing"
        {...listeners}
        {...attributes}
        aria-label={t('admin.smartAssignment.dragHandle')}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--admin-text)]">{student.full_name}</p>
        <p className="truncate text-xs text-[var(--admin-text-muted)]">
          {student.filiere} · {student.level}
          {student.sector ? ` · ${student.sector}` : ''}
        </p>
        <p className="truncate text-xs text-[var(--admin-text-muted)]">
          {student.internship_type}
          {student.internship_company ? ` · ${student.internship_company}` : ''}
        </p>
        {student.match_score != null && (
          <span className="mt-1 inline-block rounded-full bg-[var(--admin-brand-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--admin-brand)]">
            {t('admin.smartAssignment.matchScore', { score: student.match_score })}
          </span>
        )}
      </div>
      {student.assignment_id && onToggleLock && (
        <button
          type="button"
          onClick={() => onToggleLock(student.assignment_id!, !student.is_locked)}
          className="shrink-0 rounded p-1 text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)]"
          title={
            student.is_locked
              ? t('admin.smartAssignment.unlock')
              : t('admin.smartAssignment.lock')
          }
        >
          {student.is_locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
};

export default SmartAssignmentStudentRow;
