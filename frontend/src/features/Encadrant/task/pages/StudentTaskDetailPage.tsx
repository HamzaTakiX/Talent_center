import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EncadrantLayout from '../../components/EncadrantLayout';
import StudentTaskDetailHeader from '../components/StudentTaskDetailHeader';
import StudentTaskDetailList from '../components/StudentTaskDetailList';
import {
  STUDENT_TASK_DETAIL_CARD,
  STUDENT_TASK_DETAIL_PAGE_ROOT,
} from '../constants/studentTaskDetailLayout';
import { ENCADRANT_TASK_PATH } from '../constants/routes';
import { getStudentTaskDetail } from '../data/studentTaskDetailMock';

const StudentTaskDetailPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { studentId } = useParams<{ studentId: string }>();
  const detail = studentId ? getStudentTaskDetail(studentId) : undefined;

  if (!detail) {
    return <Navigate to={ENCADRANT_TASK_PATH} replace />;
  }

  return (
    <EncadrantLayout>
      <div id="encadrant-student-task-detail-root" className={STUDENT_TASK_DETAIL_PAGE_ROOT}>
        <section
          className={STUDENT_TASK_DETAIL_CARD}
          aria-label={t('encadrant.task.detail.title', { name: detail.name })}
        >
          <StudentTaskDetailHeader detail={detail} />
          <StudentTaskDetailList tasks={detail.tasks} />
        </section>
      </div>
    </EncadrantLayout>
  );
};

export default StudentTaskDetailPage;
