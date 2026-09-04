import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import MeetingRoomPage from '../../../../shared/meeting-room/pages/MeetingRoomPage';

const StudentMeetingRoomPage: FunctionComponent = () => (
  <MeetingRoomPage portal="student" Layout={StudentLayout} />
);

export default StudentMeetingRoomPage;
