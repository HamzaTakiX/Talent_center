import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Bookmark, BookmarkCheck, Check, Sparkles } from 'lucide-react';
import AdminUserAvatar from '../../../../admin/dashboard/components/AdminUserAvatar';
import { useAuth } from '../../../../auth/hooks/useAuth';
import InternshipAssistantBot from '../../components/InternshipAssistantBot';
import type { CoachMessage, MessageQuickAction, StructuredBlock } from '../types/careerCoach';
import { formatCoachMessage } from '../utils/formatCoachMessage';

const TONE_ICON = {
  positive: Check,
  warning: AlertTriangle,
  neutral: Sparkles,
};

const TONE_CLASS = {
  positive: 'sr-acc-block__item--positive',
  warning: 'sr-acc-block__item--warning',
  neutral: 'sr-acc-block__item--neutral',
};

interface StructuredMessageProps {
  blocks: StructuredBlock[];
  streamProgress: number;
  isStreaming: boolean;
}

function blockWeight(block: StructuredBlock): number {
  const base = 30;
  if (block.type === 'list' && block.items) return base + block.items.length * 24;
  if (block.type === 'actions' && block.actionKeys) return base + block.actionKeys.length * 20;
  return base;
}

const StructuredMessage: FunctionComponent<StructuredMessageProps> = ({
  blocks,
  streamProgress,
  isStreaming,
}) => {
  const { t } = useTranslation();
  let consumed = 0;

  return (
    <div className="sr-acc-blocks">
      {blocks.map((block, blockIndex) => {
        const weight = blockWeight(block);
        const blockStart = consumed;
        consumed += weight;
        const visible = !isStreaming || streamProgress >= blockStart;

        if (!visible) return null;

        return (
          <div key={`${block.type}-${blockIndex}`} className="sr-acc-block">
            <p className="sr-acc-block__title">{t(block.titleKey)}</p>

            {block.type === 'list' && block.items && (
              <ul className="sr-acc-block__list">
                {block.items.map((item) => {
                  const Icon = TONE_ICON[item.tone];
                  return (
                    <li key={item.textKey} className={`sr-acc-block__item ${TONE_CLASS[item.tone]}`}>
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span>{t(item.textKey)}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {block.type === 'actions' && block.actionKeys && (
              <ul className="sr-acc-block__actions">
                {block.actionKeys.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            )}

            {block.type === 'improvement' && block.improvement && (
              <div className="sr-acc-block__improvement">
                {block.improvement.cvScore !== undefined && (
                  <span>+{block.improvement.cvScore} {t('student.internshipOffers.careerCoach.responses.cvScoreLabel')}</span>
                )}
                {block.improvement.atsScore !== undefined && (
                  <span>+{block.improvement.atsScore}% {t('student.internshipOffers.careerCoach.responses.atsScoreLabel')}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface CareerCoachMessageBubbleProps {
  message: CoachMessage;
  onQuickAction?: (action: MessageQuickAction) => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

const CareerCoachMessageBubble: FunctionComponent<CareerCoachMessageBubbleProps> = ({
  message,
  onQuickAction,
  isPinned = false,
  onTogglePin,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isUser = message.role === 'user';
  const isThinking = Boolean(message.isStreaming && !message.text?.trim());
  const canPin = !isUser && !message.isStreaming && Boolean(message.text?.trim()) && onTogglePin;

  return (
    <div
      className={`sr-acc-msg${isUser ? ' sr-acc-msg--user' : ' sr-acc-msg--ai'}${
        isThinking ? ' sr-acc-msg--thinking' : ''
      }`}
    >
      {isUser ? (
        <div className="sr-acc-msg__avatar sr-acc-msg__avatar--user" aria-hidden>
          <AdminUserAvatar user={user} size="sm" className="sr-acc-msg__user-photo" />
        </div>
      ) : (
        <div className="sr-acc-msg__avatar" aria-hidden>
          <InternshipAssistantBot
            variant="avatar"
            animated={isThinking}
            className="sr-acc-bot sr-acc-bot--avatar"
            ariaLabel={
              isThinking
                ? t('student.internshipOffers.careerCoach.conversation.thinking')
                : t('student.internshipOffers.careerCoach.header.title')
            }
          />
        </div>
      )}
      <div className="sr-acc-msg__body">
        {isUser ? (
          <div className="sr-cva-assistant__bubble sr-cva-assistant__bubble--user">
            {message.text && <p className="m-0">{message.text}</p>}
            {message.attachmentName && (
              <p className="sr-acc-msg__attachment m-0 mt-1">{message.attachmentName}</p>
            )}
          </div>
        ) : (
          <>
            <div
              className={`sr-cva-assistant__bubble sr-cva-assistant__bubble--ai sr-acc-msg__bubble--ai${
                isThinking ? ' sr-acc-msg__bubble--thinking' : ''
              }${canPin ? ' sr-acc-msg__bubble--pinnable' : ''}`}
            >
              {canPin && (
                <button
                  type="button"
                  className={`sr-acc-msg__pin-btn${isPinned ? ' sr-acc-msg__pin-btn--active' : ''}`}
                  onClick={onTogglePin}
                  aria-label={
                    isPinned
                      ? t('student.internshipOffers.careerCoach.summary.removeFromReport')
                      : t('student.internshipOffers.careerCoach.summary.addToReport')
                  }
                  aria-pressed={isPinned}
                  title={
                    isPinned
                      ? t('student.internshipOffers.careerCoach.summary.removeFromReport')
                      : t('student.internshipOffers.careerCoach.summary.addToReport')
                  }
                >
                  {isPinned ? (
                    <BookmarkCheck size={13} aria-hidden />
                  ) : (
                    <Bookmark size={13} aria-hidden />
                  )}
                </button>
              )}
              {message.text ? (
                <div className="sr-acc-msg__formatted-wrap">{formatCoachMessage(message.text)}</div>
              ) : isThinking ? (
                <p className="sr-acc-msg__thinking-text m-0">
                  {t('student.internshipOffers.careerCoach.conversation.thinking')}
                </p>
              ) : (
                <>
                  <p className="sr-acc-msg__intro m-0">
                    {t(message.introKey ?? 'student.internshipOffers.careerCoach.responses.intro')}
                  </p>
                  {message.blocks && (
                    <StructuredMessage
                      blocks={message.blocks}
                      streamProgress={message.streamProgress ?? 0}
                      isStreaming={message.isStreaming ?? false}
                    />
                  )}
                </>
              )}
              {message.isStreaming && message.text ? (
                <span className="sr-acc-msg__cursor" aria-hidden />
              ) : null}
            </div>
            {!message.isStreaming && message.quickActions && onQuickAction && (
              <div className="sr-cva-quick-actions sr-acc-msg__actions">
                {message.quickActions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    className="sr-cva-quick-btn"
                    onClick={() => onQuickAction(action)}
                  >
                    {t(`student.internshipOffers.careerCoach.quickActions.${action}`)}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CareerCoachMessageBubble;
