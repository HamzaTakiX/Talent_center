import { FunctionComponent } from 'react';
import { STUDENT_TASK_DETAIL_LIST } from '../constants/studentTaskDetailLayout';
import type { StudentTaskItem } from '../types';
import StudentTaskDetailItemCard from './StudentTaskDetailItemCard';

interface StudentTaskDetailListProps {
  tasks: StudentTaskItem[];
}

const StudentTaskDetailList: FunctionComponent<StudentTaskDetailListProps> = ({ tasks }) => (
  <div className={STUDENT_TASK_DETAIL_LIST}>
    {tasks.map((task) => (
      <StudentTaskDetailItemCard key={task.id} task={task} />
    ))}
  </div>
);

export default StudentTaskDetailList;
