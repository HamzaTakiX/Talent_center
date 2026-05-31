import { FunctionComponent } from 'react';
import EncadrantLayout from '../../../../components/EncadrantLayout';
import { AssignedStudentsListSection, AssignedStudentsSummaryGrid } from '../components';
import { ASSIGNED_STUDENTS_PAGE_ROOT } from '../constants/assignedStudentsLayout';

const AssignedStudentsPage: FunctionComponent = () => (
  <EncadrantLayout headerTitle="Assigned Students" headerSubtitle="Encadrant Portal">
    <div id="encadrant-assigned-students-root" className={ASSIGNED_STUDENTS_PAGE_ROOT}>
      <header className="flex min-w-0 flex-col gap-1">
        <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[#171717] sm:text-2xl">
          Assigned Students
        </h1>
        <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
          Students under your supervision
        </p>
      </header>

      <AssignedStudentsSummaryGrid />
      <AssignedStudentsListSection />
    </div>
  </EncadrantLayout>
);

export default AssignedStudentsPage;

