import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
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

const TaskCreationGrid: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
  <section aria-label="Create tasks" className={TASK_CREATION_GRID}>
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
          <h3 className="m-0 text-base font-semibold leading-6 text-[#171717] sm:text-lg">
            {option.title}
          </h3>
          <p className="m-0 max-w-[280px] text-sm font-normal leading-5 text-[#717182]">
            {option.subtitle}
          </p>
        </button>
      );
    })}
  </section>
  );
};

export default TaskCreationGrid;
