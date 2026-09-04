import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCollaborationContext } from '../../../shared/meeting-room/hooks/useCollaborationContext';
import { WORKSPACE_GRID, WORKSPACE_SECTION_CARD } from '../constants/workspaceLayout';
import { workspaceStudentsMock } from '../data/workspaceMock';
import type { WorkspaceStudent } from '../types';
import WorkspaceStudentCard from './WorkspaceStudentCard';
import WorkspaceToolbar from './WorkspaceToolbar';

const WorkspaceStudentsSection: FunctionComponent = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const { context } = useCollaborationContext();

  const students = useMemo<WorkspaceStudent[]>(() => {
    const assigned = (context?.students ?? []).filter((student) => student.profile_id != null);
    if (!assigned.length) return workspaceStudentsMock;
    return assigned.map((student) => ({
      id: String(student.profile_id),
      name: student.display_name,
      level: t('encadrant.workspace.assignedStudentLevel'),
      activeSessions: 0,
      lastActivity: '—',
    }));
  }, [context?.students, t]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.level.toLowerCase().includes(q)
    );
  }, [searchQuery, students]);

  return (
    <section className={WORKSPACE_SECTION_CARD} aria-label={t('encadrant.workspace.studentsAria')}>
      <WorkspaceToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className={WORKSPACE_GRID}>
        {filteredStudents.map((student) => (
          <WorkspaceStudentCard key={student.id} student={student} />
        ))}
      </div>
    </section>
  );
};

export default WorkspaceStudentsSection;
