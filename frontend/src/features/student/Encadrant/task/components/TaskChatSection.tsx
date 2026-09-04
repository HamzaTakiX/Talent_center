import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SupportMessageComposer from '../../../../admin/shared/admin-support-inbox/components/SupportMessageComposer';
import { StandardChatMessageThread } from '../../../../shared/chat-design-system';
import {
  buildTaskEntityRef,
  studentSupervisionTaskChatPath,
} from '../../../../shared/contextual-chat/utils/supervisionEntityChat';
import type { TaskAssigneeProfile } from '../data/taskAssignees';
import { useTaskChat } from '../hooks/useTaskChat';

interface TaskChatSectionProps {
  taskId: string;
  taskTitle: string;
  taskSubtitle?: string;
  assignee: TaskAssigneeProfile;
}

const TaskChatSection: FunctionComponent<TaskChatSectionProps> = ({
  taskId,
  taskTitle,
  taskSubtitle,
  assignee,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { messages, sendMessage, loading, error } = useTaskChat(taskId, taskTitle, taskSubtitle);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const assigneeName = t(assignee.nameKey);

  const pendingEntities = useMemo(
    () => [buildTaskEntityRef(taskId, taskTitle, taskSubtitle)],
    [taskId, taskTitle, taskSubtitle],
  );

  useEffect(() => {
    setAvatarFailed(false);
  }, [assignee.avatarUrl]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, taskId]);

  const openMainChat = () => {
    navigate(studentSupervisionTaskChatPath(taskId, taskTitle, taskSubtitle));
  };

  return (
    <section className="student-task-drawer-chat" aria-label={t('student.encadrant.task.platform.drawer.chat.title')}>
      <header className="student-task-drawer-chat-head">
        <div className="student-task-drawer-chat-identity">
          {avatarFailed ? (
            <span className="student-task-drawer-chat-avatar is-fallback" aria-hidden>
              {assignee.initials}
            </span>
          ) : (
            <img
              src={assignee.avatarUrl}
              alt=""
              className="student-task-drawer-chat-avatar"
              onError={() => setAvatarFailed(true)}
            />
          )}
          <div className="min-w-0">
            <h3 className="student-task-drawer-chat-title">
              {t('student.encadrant.task.platform.drawer.chat.title')}
            </h3>
            <p className="student-task-drawer-chat-subtitle">
              {t('student.encadrant.task.platform.drawer.chat.subtitle', { name: assigneeName })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="student-task-drawer-chat-tag">
            <Tag className="h-3 w-3" aria-hidden />
            {taskTitle}
          </span>
          <button
            type="button"
            className="student-task-drawer-chat-open"
            onClick={openMainChat}
            aria-label={t('student.encadrant.task.platform.drawer.chat.openInChat', {
              defaultValue: 'Ouvrir dans le chat',
            })}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="student-task-drawer-chat-messages isi-messages">
        {error ? (
          <p className="student-task-drawer-chat-error">
            {t('student.encadrant.task.platform.drawer.chat.loadError', {
              defaultValue: 'Impossible de charger le chat de cette tâche.',
            })}
          </p>
        ) : (
          <StandardChatMessageThread
            messages={messages}
            inboxMode="student"
            emptyLabel={
              loading
                ? t('student.encadrant.task.platform.drawer.chat.loading', {
                    defaultValue: 'Chargement des messages…',
                  })
                : t('student.encadrant.task.platform.drawer.chat.empty')
            }
          />
        )}
      </div>

      <SupportMessageComposer
        value={draft}
        onChange={setDraft}
        onSend={() => {
          if (sending) return;
          const text = draft;
          setDraft('');
          setSending(true);
          void sendMessage(text).finally(() => setSending(false));
        }}
        disabled={Boolean(error) || sending}
        placeholder={t('student.encadrant.task.platform.drawer.chat.composer')}
        inputAriaLabel={t('student.encadrant.task.platform.drawer.chat.composer')}
        sendAriaLabel={t('student.encadrant.task.platform.drawer.chat.send')}
        showVoice={false}
        showHint={false}
        pendingEntities={pendingEntities}
      />
    </section>
  );
};

export default TaskChatSection;
