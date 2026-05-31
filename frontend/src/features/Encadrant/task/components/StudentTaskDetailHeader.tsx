import { FunctionComponent } from 'react';
import type { StudentTaskDetail } from '../types';
import {
  STUDENT_TASK_DETAIL_HEADER,
  STUDENT_TASK_DETAIL_HEADER_MAIN,
  STUDENT_TASK_DETAIL_PROGRESS_LABEL,
  STUDENT_TASK_DETAIL_PROGRESS_VALUE,
  STUDENT_TASK_DETAIL_PROGRESS_WRAP,
  STUDENT_TASK_DETAIL_SUBTITLE,
  STUDENT_TASK_DETAIL_TITLE,
} from '../constants/studentTaskDetailLayout';

interface StudentTaskDetailHeaderProps {
  detail: StudentTaskDetail;
}

const StudentTaskDetailHeader: FunctionComponent<StudentTaskDetailHeaderProps> = ({ detail }) => (
  <header className={STUDENT_TASK_DETAIL_HEADER}>
    <div className={STUDENT_TASK_DETAIL_HEADER_MAIN}>
      <h1 className={STUDENT_TASK_DETAIL_TITLE}>Tasks for {detail.name}</h1>
      <p className={STUDENT_TASK_DETAIL_SUBTITLE}>
        {detail.level} • {detail.completedTasks} of {detail.totalTasks} tasks completed
      </p>
    </div>
    <div className={STUDENT_TASK_DETAIL_PROGRESS_WRAP}>
      <p className={STUDENT_TASK_DETAIL_PROGRESS_VALUE}>{detail.progressPercent}%</p>
      <p className={STUDENT_TASK_DETAIL_PROGRESS_LABEL}>Overall Progress</p>
    </div>
  </header>
);

export default StudentTaskDetailHeader;
