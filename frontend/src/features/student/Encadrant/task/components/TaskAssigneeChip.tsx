import { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TaskAssigneeProfile } from '../data/taskAssignees';

interface TaskAssigneeChipProps {
  assignee: TaskAssigneeProfile;
  compact?: boolean;
  showLabel?: boolean;
}

const TaskAssigneeChip: FunctionComponent<TaskAssigneeChipProps> = ({
  assignee,
  compact,
  showLabel = true,
}) => {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const name = t(assignee.nameKey);

  return (
    <div className={`student-task-assignee ${compact ? 'is-compact' : ''}`}>
      {imageFailed ? (
        <span className="student-task-assignee-fallback" aria-hidden>
          {assignee.initials}
        </span>
      ) : (
        <img
          src={assignee.avatarUrl}
          alt=""
          className="student-task-assignee-photo"
          onError={() => setImageFailed(true)}
        />
      )}
      <span className="student-task-assignee-copy">
        {showLabel ? (
          <span className="student-task-assignee-label">
            {t('student.encadrant.task.platform.createdBy')}
          </span>
        ) : null}
        <span className="student-task-assignee-name">{name}</span>
      </span>
    </div>
  );
};

export default TaskAssigneeChip;
