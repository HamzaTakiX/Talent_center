import { FunctionComponent } from 'react';
import StudentSearchEmptyState from '../../../ui/StudentSearchEmptyState';
import type { StudentPlatformTask } from '../types';
import TaskRichCard from './TaskRichCard';

interface TaskListViewProps {
  tasks: StudentPlatformTask[];
  onSelectTask: (id: string) => void;
}

const TaskListView: FunctionComponent<TaskListViewProps> = ({ tasks, onSelectTask }) => (
  <div className="flex flex-col gap-3 p-4 sm:p-5">
    {tasks.length === 0 ? (
      <StudentSearchEmptyState
        titleKey="student.encadrant.task.platform.empty.tasksTitle"
        descriptionKey="student.encadrant.task.platform.empty.tasksDesc"
        variant="inline"
      />
    ) : (
      tasks.map((task) => (
        <TaskRichCard key={task.id} task={task} onClick={() => onSelectTask(task.id)} />
      ))
    )}
  </div>
);

export default TaskListView;
