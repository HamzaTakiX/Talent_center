import { FunctionComponent, useCallback } from 'react';
import type { InterviewSimulatorAction } from '../types';
import InterviewSimulatorActionButton from './InterviewSimulatorActionButton';
import { IS_ACTIONS_INNER, IS_ACTIONS_SECTION } from '../constants/interviewSimulatorStyles';

interface InterviewSimulatorActionsProps {
  actions: InterviewSimulatorAction[];
}

const InterviewSimulatorActions: FunctionComponent<InterviewSimulatorActionsProps> = ({
  actions,
}) => {
  const handleAction = useCallback((actionId: string) => {
    // Préparé pour branchement ultérieur
    void actionId;
  }, []);

  return (
    <section className={IS_ACTIONS_SECTION} aria-label="Interview setup actions">
      <div className={IS_ACTIONS_INNER}>
        {actions.map((action) => (
          <InterviewSimulatorActionButton
            key={action.id}
            label={action.label}
            variant={action.variant}
            onClick={() => handleAction(action.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default InterviewSimulatorActions;
