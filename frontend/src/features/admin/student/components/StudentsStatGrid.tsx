import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentCardStatGrid from './StudentCardStatGrid';
import { studentDashboardStats } from '../data/studentsDashboardMock';

const routeByLabelKey: Record<string, string> = {
  'admin.kpi.students.totalStudents': '/admin/students/total-students',
  'admin.kpi.students.active': '/admin/students/active-students',
  'admin.kpi.students.withoutInternship': '/admin/students/without-internship',
  'admin.kpi.students.withInternship': '/admin/students/with-internship',
  'admin.kpi.students.engagementLevel': '/admin/students/engagement-level',
  'Total Students': '/admin/students/total-students',
  Active: '/admin/students/active-students',
  'Without Internship': '/admin/students/without-internship',
  'With Internship': '/admin/students/with-internship',
  'Engagement Level': '/admin/students/engagement-level',
};

const StudentsStatGrid: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <StudentCardStatGrid
      stats={studentDashboardStats}
      columns={3}
      onStatClick={(key) => {
        const route = routeByLabelKey[key];
        if (route) navigate(route);
      }}
    />
  );
};

export default StudentsStatGrid;
