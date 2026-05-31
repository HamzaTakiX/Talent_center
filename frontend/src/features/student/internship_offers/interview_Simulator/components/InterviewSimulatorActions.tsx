import { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { InterviewSimulatorAction } from '../types';
import InterviewSimulatorActionButton from './InterviewSimulatorActionButton';
import { IS_ACTIONS_INNER, IS_ACTIONS_SECTION } from '../constants/interviewSimulatorStyles';

interface InterviewSimulatorActionsProps {
  actions: InterviewSimulatorAction[];
}

const actionLabelKeyMap: Record<string, 'uploadCv' | 'selectOffer' | 'describeCompany'> = {
  'upload-cv': 'uploadCv',
  'select-offer': 'selectOffer',
  'describe-company': 'describeCompany',
};

const InterviewSimulatorActions: FunctionComponent<InterviewSimulatorActionsProps> = ({
  actions,
}) => {
  const { t } = useTranslation();

  const handleAction = useCallback((actionId: string) => {
    void actionId;
  }, []);

  return (
    <section className={IS_ACTIONS_SECTION} aria-label={t('student.internshipOffers.interviewSimulator.setupActionsAria')}>
      <div className={IS_ACTIONS_INNER}>
        {actions.map((action) => (
          <InterviewSimulatorActionButton
            key={action.id}
            label={t(`student.internshipOffers.interviewSimulator.${actionLabelKeyMap[action.id]}`)}
            variant={action.variant}
            onClick={() => handleAction(action.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default InterviewSimulatorActions;
