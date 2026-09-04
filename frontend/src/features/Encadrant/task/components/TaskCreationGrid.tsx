import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  ENCADRANT_TASK_AI_CREATION_PATH,
  ENCADRANT_TASK_CREATE_MANUALLY_PATH,
} from '../constants/routes';
import {
  TASK_CREATION_CARD_AI,
  TASK_CREATION_CARD_MANUAL,
  TASK_CREATION_GRID,
} from '../constants/taskLayout';
import { TASK_AI_ICON_WRAP, TASK_MANUAL_ICON_WRAP } from '../constants/taskStyles';
import { taskCreationOptionsMock } from '../data';

const TITLE_KEY = {
  manual: 'encadrant.task.createManually',
  ai: 'encadrant.task.createWithAi',
} as const;

const SUBTITLE_KEY = {
  manual: 'encadrant.task.createManuallySubtitle',
  ai: 'encadrant.task.createWithAiSubtitle',
} as const;

const TaskCreationGrid: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section aria-label={t('encadrant.task.createAria')} className={TASK_CREATION_GRID}>
      {taskCreationOptionsMock.map((option) => {
        const isAi = option.id === 'ai';
        return (
          <button
            key={option.id}
            type="button"
            className={isAi ? TASK_CREATION_CARD_AI : TASK_CREATION_CARD_MANUAL}
            onClick={() => {
              if (option.id === 'manual') {
                navigate(ENCADRANT_TASK_CREATE_MANUALLY_PATH);
              } else if (option.id === 'ai') {
                navigate(ENCADRANT_TASK_AI_CREATION_PATH);
              }
            }}
          >
            <div className={isAi ? TASK_AI_ICON_WRAP : TASK_MANUAL_ICON_WRAP}>
              {isAi ? (
                <Sparkles className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              ) : (
                <Plus className="h-7 w-7" strokeWidth={2} aria-hidden />
              )}
            </div>
            <h3 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)] sm:text-lg">
              {t(TITLE_KEY[option.id])}
            </h3>
            <p className="m-0 max-w-[280px] text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
              {t(SUBTITLE_KEY[option.id])}
            </p>
          </button>
        );
      })}
    </section>
  );
};

export default TaskCreationGrid;
