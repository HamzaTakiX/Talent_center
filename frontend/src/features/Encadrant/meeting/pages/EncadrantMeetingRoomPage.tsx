import { FunctionComponent } from 'react';
import EncadrantLayout from '../../components/EncadrantLayout';
import MeetingRoomPage from '../../../shared/meeting-room/pages/MeetingRoomPage';

const EncadrantMeetingRoomPage: FunctionComponent = () => (
  <MeetingRoomPage portal="encadrant" Layout={EncadrantLayout} />
);

export default EncadrantMeetingRoomPage;
