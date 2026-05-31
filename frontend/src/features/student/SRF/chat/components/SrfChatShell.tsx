import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import SrfFinancialSidebar from './SrfFinancialSidebar';
import SrfChatThread from './SrfChatThread';

const SrfChatShell: FunctionComponent = () => (
  <StudentLayout mainFillHeight contentFlush>
    <div className="student-srf-chat-shell admin-chat-shell flex h-0 min-h-0 flex-1 flex-col overflow-hidden font-inter">
      <div className="student-srf-chat-layout flex min-h-0 flex-1 overflow-hidden">
        <SrfFinancialSidebar />
        <SrfChatThread />
      </div>
    </div>
  </StudentLayout>
);

export default SrfChatShell;
