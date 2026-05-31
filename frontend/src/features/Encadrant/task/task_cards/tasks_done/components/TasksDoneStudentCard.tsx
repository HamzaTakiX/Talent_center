import { FunctionComponent } from 'react';
import { User } from 'lucide-react';
import { TASKS_DONE_STUDENT_CARD } from '../constants/tasksDoneLayout';
import {
  TASKS_DONE_BADGE,
  TASKS_DONE_PROGRESS_FILL,
  TASKS_DONE_PROGRESS_TRACK,
} from '../constants/tasksDoneStyles';
import type { TasksDoneStudent } from '../types';

interface TasksDoneStudentCardProps {
  student: TasksDoneStudent;
}

const TasksDoneStudentCard: FunctionComponent<TasksDoneStudentCardProps> = ({ student }) => (
  <article className={TASKS_DONE_STUDENT_CARD}>
    <div className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-base font-semibold leading-6 text-[#171717]">{student.name}</h3>
        <p className="m-0 mt-0.5 text-sm font-normal leading-5 text-[#717182]">{student.level}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#525252]">
        <User className="h-4 w-4 shrink-0 text-[#9ca3af]" strokeWidth={1.75} aria-hidden />
        <span className="whitespace-nowrap tabular-nums">{student.totalTasks} tasks</span>
      </div>
    </div>

    <div className="flex min-w-0 flex-col">
      <p className="m-0 text-sm font-semibold leading-5 text-[#171717]">Next Task:</p>
      <p className="m-0 mt-1 text-sm font-medium leading-5 text-[#171717]">{student.nextTaskTitle}</p>
      <p className="m-0 mt-1 text-xs font-normal leading-4 text-[#717182]">
        Due: {student.nextTaskDue}
      </p>
    </div>

    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium leading-5 text-[#171717]">Progress</span>
        <span className="text-sm font-medium tabular-nums leading-5 text-[#525252]">
          {student.completedTasks}/{student.totalTasks} ({student.progressPercent}%)
        </span>
      </div>
      <div
        className={TASKS_DONE_PROGRESS_TRACK}
        role="progressbar"
        aria-valuenow={student.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={TASKS_DONE_PROGRESS_FILL} style={{ width: `${student.progressPercent}%` }} />
      </div>
    </div>

    <span className={TASKS_DONE_BADGE}>Done</span>
  </article>
);

export default TasksDoneStudentCard;
