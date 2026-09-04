import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
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

const StudentTaskDetailHeader: FunctionComponent<StudentTaskDetailHeaderProps> = ({ detail }) => {
  const { t } = useTranslation();

  return (
    <header className={STUDENT_TASK_DETAIL_HEADER}>
      <div className={STUDENT_TASK_DETAIL_HEADER_MAIN}>
        <h1 className={STUDENT_TASK_DETAIL_TITLE}>
          {t('encadrant.task.detail.title', { name: detail.name })}
        </h1>
        <p className={STUDENT_TASK_DETAIL_SUBTITLE}>
          {t('encadrant.task.detail.subtitle', {
            level: detail.level,
            done: detail.completedTasks,
            total: detail.totalTasks,
          })}
        </p>
      </div>
      <div className={STUDENT_TASK_DETAIL_PROGRESS_WRAP}>
        <p className={STUDENT_TASK_DETAIL_PROGRESS_VALUE}>{detail.progressPercent}%</p>
        <p className={STUDENT_TASK_DETAIL_PROGRESS_LABEL}>
          {t('encadrant.task.detail.overallProgress')}
        </p>
      </div>
    </header>
  );
};

export default StudentTaskDetailHeader;
