import { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminChatMockData } from '../../../i18n/useAdminChatMockData';
import StudentDetailModal from '../../components/StudentDetailModal';
import DeskSupportInbox from '../../../shared/admin-support-inbox/components/DeskSupportInbox';
import { studentDeskParticipants, studentDeskInitialMessages } from '../data/studentChatMock';
import StudentDeskContextPanel from './StudentDeskContextPanel';

const StudentDeskSupportInbox: FunctionComponent = () => {
  const navigate = useNavigate();
  const [viewStudentUserId, setViewStudentUserId] = useState<number | null>(null);
  const mock = useAdminChatMockData('students', studentDeskParticipants, studentDeskInitialMessages);

  return (
    <>
      <StudentDetailModal
        open={viewStudentUserId != null}
        studentId={viewStudentUserId}
        onClose={() => setViewStudentUserId(null)}
        onEdit={(id) => {
          setViewStudentUserId(null);
          navigate(`/admin/students/${id}/edit`);
        }}
      />

      <DeskSupportInbox
        channel="students"
        participants={mock.participants}
        initialMessages={mock.messages}
        renderContextPanel={(conversation) => (
          <StudentDeskContextPanel
            conversation={conversation}
            onOpenStudent={
              conversation.userId
                ? () => setViewStudentUserId(conversation.userId!)
                : undefined
            }
          />
        )}
      />
    </>
  );
};

export default StudentDeskSupportInbox;
