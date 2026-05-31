import { FunctionComponent, useMemo, useState } from 'react';
import { WORKSPACE_GRID, WORKSPACE_SECTION_CARD } from '../constants/workspaceLayout';
import { workspaceStudentsMock } from '../data/workspaceMock';
import WorkspaceStudentCard from './WorkspaceStudentCard';
import WorkspaceToolbar from './WorkspaceToolbar';

const WorkspaceStudentsSection: FunctionComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return workspaceStudentsMock;
    return workspaceStudentsMock.filter(
      (s) => s.name.toLowerCase().includes(q) || s.level.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className={WORKSPACE_SECTION_CARD} aria-label="Student workspaces">
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
