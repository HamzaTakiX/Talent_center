import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, FolderPlus, User } from 'lucide-react';
import type { SuggestedStudent } from '../../types/createOfferWorkflow';

const PREFIX = 'admin.forms.createOfferStudio.suggestedStudents';

interface SuggestedStudentsPanelProps {
  students: SuggestedStudent[];
}

const SuggestedStudentsPanel: FunctionComponent<SuggestedStudentsPanelProps> = ({ students }) => {
  const { t } = useTranslation();

  if (students.length === 0) return null;

  return (
    <div className="offer-studio-panel">
      <div className="offer-studio-panel__head">
        <h3 className="offer-studio-panel__title">{t(`${PREFIX}.title`)}</h3>
        <p className="offer-studio-panel__desc">{t(`${PREFIX}.desc`)}</p>
      </div>
      <div className="offer-studio-panel__body !pt-2">
        {students.map((student) => (
          <div key={student.id} className="offer-student-row">
            <span className="offer-student-row__avatar" aria-hidden>
              {student.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </span>
            <div className="offer-student-row__info">
              <p className="offer-student-row__name">{student.name}</p>
              <p className="offer-student-row__meta">
                {student.program} · {student.level} · {student.skills.slice(0, 3).join(', ')}
              </p>
            </div>
            <span className="offer-student-row__match">{student.matchPercent}%</span>
            <div className="flex gap-1">
              <button type="button" className="admin-btn-secondary rounded p-1.5" title={t(`${PREFIX}.notify`)}>
                <Bell className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button type="button" className="admin-btn-secondary rounded p-1.5" title={t(`${PREFIX}.viewProfile`)}>
                <User className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button type="button" className="admin-btn-secondary rounded p-1.5" title={t(`${PREFIX}.addToCollection`)}>
                <FolderPlus className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedStudentsPanel;
