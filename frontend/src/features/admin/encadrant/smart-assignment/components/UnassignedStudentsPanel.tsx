import { FunctionComponent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentStudentRow } from '../../../api/types';
import AdminSectionEmptyState from '../../../ui/AdminSectionEmptyState';
import SmartAssignmentStudentRowComponent from './SmartAssignmentStudentRow';

interface UnassignedStudentsPanelProps {
  students: SmartAssignmentStudentRow[];
}

const UnassignedStudentsPanel: FunctionComponent<UnassignedStudentsPanelProps> = ({ students }) => {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: 'unassigned', data: { encadrantProfileId: null } });

  return (
    <section
      className={`admin-module-panel rounded-xl p-4 shadow-sm ${
        isOver ? 'ring-2 ring-amber-400' : 'border-[var(--admin-border)]'
      }`}
    >
      <h2 className="text-sm font-semibold text-[var(--admin-text)]">
        {t('admin.smartAssignment.unassignedTitle', { count: students.length })}
      </h2>
      <p className="text-xs text-[var(--admin-text-muted)]">{t('admin.smartAssignment.unassignedHint')}</p>
      <div ref={setNodeRef} className="mt-3 flex max-h-96 flex-col gap-2 overflow-y-auto">
        {students.length === 0 ? (
          <AdminSectionEmptyState
            variant="inline"
            iconPreset="inbox"
            title={t('admin.smartAssignment.allAssigned')}
          />
        ) : (
          students.map((s) => (
            <SmartAssignmentStudentRowComponent key={s.student_profile_id} student={s} />
          ))
        )}
      </div>
    </section>
  );
};

export default UnassignedStudentsPanel;
