import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { whiteboardCollaborators } from '../data/whiteboardMock';

const WhiteboardCollaboratorsBar: FunctionComponent = () => {
  const { t } = useTranslation();
  const active = whiteboardCollaborators.filter((c) => c.isActive);

  return (
    <div className="student-whiteboard-collab" title={t('student.encadrant.workspace.whiteboardPage.collaborators.title')}>
      <span className="student-whiteboard-collab__live">
        <span className="student-whiteboard-collab__pulse" aria-hidden />
        {t('student.encadrant.workspace.whiteboardPage.collaborators.live', { count: active.length })}
      </span>
      <div className="student-whiteboard-collab__avatars" role="list">
        {whiteboardCollaborators.map((person) => (
          <div
            key={person.id}
            role="listitem"
            className="student-whiteboard-collab__avatar"
            style={{ ['--wb-avatar-color' as string]: person.color }}
            title={`${t(person.nameKey)} — ${t(`student.encadrant.workspace.platform.status.${person.status}`)}`}
          >
            <span>{person.initials}</span>
            <span
              className={`student-whiteboard-collab__presence student-whiteboard-collab__presence--${person.status}`}
              aria-hidden
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhiteboardCollaboratorsBar;
