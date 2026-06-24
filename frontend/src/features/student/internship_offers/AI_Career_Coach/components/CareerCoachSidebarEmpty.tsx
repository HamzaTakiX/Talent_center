import { FunctionComponent } from 'react';
import { MessageSquarePlus, MessagesSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CareerCoachSidebarEmptyProps {
  variant: 'active' | 'archived';
  onNewConversation?: () => void;
}

const CareerCoachSidebarEmpty: FunctionComponent<CareerCoachSidebarEmptyProps> = ({
  variant,
  onNewConversation,
}) => {
  const { t } = useTranslation();

  if (variant === 'archived') {
    return (
      <li className="sr-acc-sidebar__empty-state sr-acc-sidebar__empty-state--archived">
        <MessagesSquare className="sr-acc-sidebar__empty-icon" aria-hidden />
        <p className="sr-acc-sidebar__empty-title">
          {t('student.internshipOffers.careerCoach.history.archivedEmpty')}
        </p>
      </li>
    );
  }

  return (
    <li className="sr-acc-sidebar__empty-state">
      <div className="sr-acc-sidebar__empty-glow" aria-hidden />
      <MessagesSquare className="sr-acc-sidebar__empty-icon" aria-hidden />
      <p className="sr-acc-sidebar__empty-title">
        {t('student.internshipOffers.careerCoach.history.emptyTitle')}
      </p>
      <p className="sr-acc-sidebar__empty-desc">
        {t('student.internshipOffers.careerCoach.history.emptyDescription')}
      </p>
      {onNewConversation ? (
        <button type="button" className="sr-acc-sidebar__empty-cta" onClick={onNewConversation}>
          <MessageSquarePlus size={16} aria-hidden />
          {t('student.internshipOffers.careerCoach.history.emptyCta')}
        </button>
      ) : null}
    </li>
  );
};

export default CareerCoachSidebarEmpty;
