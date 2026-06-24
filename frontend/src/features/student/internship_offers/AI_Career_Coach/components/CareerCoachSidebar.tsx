import { FunctionComponent } from 'react';
import { Archive, MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InternshipAssistantBot from '../../components/InternshipAssistantBot';
import type { CoachConversation } from '../types/careerCoach';
import CareerCoachConversationItem from './CareerCoachConversationItem';
import CareerCoachSidebarEmpty from './CareerCoachSidebarEmpty';
import CareerCoachSidebarSkeleton from './CareerCoachSidebarSkeleton';

interface CareerCoachSidebarProps {
  conversations: CoachConversation[];
  archivedConversations: CoachConversation[];
  showArchived: boolean;
  activeConversationId: string;
  isLoading?: boolean;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onArchiveConversation: (id: string) => void;
  onUnarchiveConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onToggleArchivedView: () => void;
  onNewConversation: () => void;
}

function getConversationPreview(
  conversation: CoachConversation,
  newConversationLabel: string,
): string {
  if (conversation.title) return conversation.title;

  if (conversation.preview) {
    const text = conversation.preview.trim();
    if (text) {
      return text.length > 52 ? `${text.slice(0, 52)}…` : text;
    }
  }

  const lastUserMessage = [...conversation.messages].reverse().find((m) => m.role === 'user');
  if (lastUserMessage?.text) {
    return lastUserMessage.text.length > 52
      ? `${lastUserMessage.text.slice(0, 52)}…`
      : lastUserMessage.text;
  }

  if ((conversation.messageCount ?? 0) === 0) {
    return newConversationLabel;
  }

  return newConversationLabel;
}

const CareerCoachSidebar: FunctionComponent<CareerCoachSidebarProps> = ({
  conversations,
  archivedConversations,
  showArchived,
  activeConversationId,
  isLoading = false,
  onSelectConversation,
  onRenameConversation,
  onArchiveConversation,
  onUnarchiveConversation,
  onDeleteConversation,
  onToggleArchivedView,
  onNewConversation,
}) => {
  const { t } = useTranslation();
  const newConversationLabel = t('student.internshipOffers.careerCoach.history.newConversation');
  const visibleConversations = showArchived ? archivedConversations : conversations;
  const archiveCount = archivedConversations.length;

  return (
    <aside
      className="sr-acc-sidebar"
      aria-label={t('student.internshipOffers.careerCoach.history.aria')}
      aria-busy={isLoading}
    >
      <header className="sr-acc-sidebar__header">
        <div className="sr-acc-sidebar__brand">
          <div className="sr-acc-sidebar__logo" aria-hidden>
            <InternshipAssistantBot
              variant="avatar"
              className="sr-acc-bot sr-acc-bot--hero"
              ariaLabel={t('student.internshipOffers.careerCoach.header.title')}
            />
          </div>
          <span className="sr-acc-sidebar__title">
            {t('student.internshipOffers.careerCoach.header.title')}
          </span>
          <button
            type="button"
            className={`sr-acc-sidebar__archive-btn${showArchived ? ' sr-acc-sidebar__archive-btn--active' : ''}`}
            onClick={onToggleArchivedView}
            disabled={isLoading}
            aria-label={
              showArchived
                ? t('student.internshipOffers.careerCoach.history.hideArchived')
                : t('student.internshipOffers.careerCoach.history.showArchived')
            }
            aria-pressed={showArchived}
            title={
              showArchived
                ? t('student.internshipOffers.careerCoach.history.hideArchived')
                : t('student.internshipOffers.careerCoach.history.showArchived')
            }
          >
            <Archive size={16} aria-hidden />
            {archiveCount > 0 ? (
              <span className="sr-acc-sidebar__archive-count" aria-hidden>
                {archiveCount}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <nav
        className="sr-acc-sidebar__list"
        aria-label={
          showArchived
            ? t('student.internshipOffers.careerCoach.history.archivedTitle')
            : t('student.internshipOffers.careerCoach.history.title')
        }
      >
        <p className="sr-acc-sidebar__list-label">
          {showArchived
            ? t('student.internshipOffers.careerCoach.history.archivedTitle')
            : t('student.internshipOffers.careerCoach.history.title')}
        </p>
        {isLoading ? (
          <CareerCoachSidebarSkeleton />
        ) : (
          <ul className="sr-acc-sidebar__conversations">
            {visibleConversations.length === 0 ? (
              <CareerCoachSidebarEmpty
                variant={showArchived ? 'archived' : 'active'}
                onNewConversation={showArchived ? undefined : onNewConversation}
              />
            ) : (
              visibleConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                const preview = getConversationPreview(conversation, newConversationLabel);

                return (
                  <CareerCoachConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={isActive}
                    preview={preview}
                    isArchivedList={showArchived}
                    onSelect={() => onSelectConversation(conversation.id)}
                    onRename={(title) => onRenameConversation(conversation.id, title)}
                    onArchive={() => onArchiveConversation(conversation.id)}
                    onUnarchive={() => onUnarchiveConversation(conversation.id)}
                    onDelete={() => onDeleteConversation(conversation.id)}
                  />
                );
              })
            )}
          </ul>
        )}
      </nav>

      {!showArchived ? (
        <footer className="sr-acc-sidebar__footer">
          <button
            type="button"
            className="sr-acc-sidebar__new-btn"
            onClick={onNewConversation}
            disabled={isLoading}
          >
            <MessageSquarePlus size={18} aria-hidden />
            {t('student.internshipOffers.careerCoach.history.new')}
          </button>
        </footer>
      ) : null}
    </aside>
  );
};

export default CareerCoachSidebar;
