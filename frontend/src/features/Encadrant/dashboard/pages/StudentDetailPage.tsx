import { FunctionComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import EncadrantLayout from '../../components/EncadrantLayout';
import BackToDashboardButton from '../components/BackToDashboardButton';
import StudentDetailPanel from '../components/StudentDetailPanel';
import { ENCADRANT_PATH } from '../constants/routes';
import { STUDENT_DETAIL_PAGE_ROOT } from '../constants/studentDetailLayout';
import { getStudentDetailById } from '../data';

const StudentDetailPage: FunctionComponent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const student = studentId ? getStudentDetailById(studentId) : undefined;

  if (!student) {
    return <Navigate to={ENCADRANT_PATH} replace />;
  }

  return (
    <EncadrantLayout headerTitle={student.name} headerSubtitle="Encadrant Portal">
      <div id="encadrant-student-detail-root" className={STUDENT_DETAIL_PAGE_ROOT}>
        <BackToDashboardButton />
        <StudentDetailPanel student={student} />
      </div>
    </EncadrantLayout>
  );
};

export default StudentDetailPage;
