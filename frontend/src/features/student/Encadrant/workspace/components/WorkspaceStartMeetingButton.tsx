import { Video } from 'lucide-react';
import { workspaceMeetingStartLabel } from '../data/workspaceMock';
import { WORKSPACE_MEETING_START_BTN } from '../constants/workspaceStyles';

interface WorkspaceStartMeetingButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export default function WorkspaceStartMeetingButton({
  onClick,
  isActive = false,
}: WorkspaceStartMeetingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${WORKSPACE_MEETING_START_BTN} w-full sm:max-w-none`}
      aria-pressed={isActive}
    >
      <Video className="h-4 w-4 shrink-0" aria-hidden />
      {workspaceMeetingStartLabel}
    </button>
  );
}
