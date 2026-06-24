import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import ChatEmptyState from '../../../../admin/shared/admin-module-chat/components/ChatEmptyState';

import SupportMessageComposer from '../../../../admin/shared/admin-support-inbox/components/SupportMessageComposer';

import InternshipMessageReadStatus from '../../../../admin/offres-stage/chat/components/InternshipMessageReadStatus';

import {

  InternshipChatMessagesSkeleton,

  InternshipChatWorkspaceSkeleton,

} from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';

import type { StudentAnnouncementConversation } from '../utils/studentAnnouncementChatMappers';

import StudentAnnouncementChatHeader from './StudentAnnouncementChatHeader';



type Props = {

  conversation: StudentAnnouncementConversation | null;

  unreadTotal: number;

  messagesLoading?: boolean;

  conversationLoading?: boolean;

  statsLoading?: boolean;

  peerTyping?: boolean;

  onSend: (text: string) => void;

  onTyping?: (isTyping: boolean) => void;

  onBack?: () => void;

  onViewAnnouncement: () => void;

  onArchive: () => void;

  onUnarchive: () => void;

};



const StudentAnnouncementChatArea: FunctionComponent<Props> = ({

  conversation,

  unreadTotal,

  messagesLoading = false,

  conversationLoading = false,

  statsLoading = false,

  peerTyping = false,

  onSend,

  onTyping,

  onBack,

  onViewAnnouncement,

  onArchive,

  onUnarchive,

}) => {

  const { t } = useTranslation();

  const [draft, setDraft] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });

  }, [conversation?.messages.length, conversation?.id, peerTyping]);



  useEffect(() => {

    setDraft('');

  }, [conversation?.id]);



  const handleSend = useCallback(() => {

    const text = draft.trim();

    if (!text) return;

    onSend(text);

    setDraft('');

  }, [draft, onSend]);



  if ((conversationLoading || messagesLoading) && !conversation) {

    return <InternshipChatWorkspaceSkeleton />;

  }



  if (!conversation) {

    return (

      <section className="isi-chat isi-chat--empty">

        <ChatEmptyState

          title={t('student.announcements.chat.emptyTitle')}

          description={t('student.announcements.chat.emptyDescription')}

          moduleType="announcements"

          statsLoading={statsLoading}

          stats={{ unread: unreadTotal, pending: 0, resolved: 0 }}

        />

      </section>

    );

  }



  return (

    <section className="isi-chat">

      <StudentAnnouncementChatHeader

        conversation={conversation}

        onBack={onBack}

        onViewAnnouncement={onViewAnnouncement}

        onArchive={onArchive}

        onUnarchive={onUnarchive}

      />



      <div ref={scrollRef} className="isi-messages">

        {messagesLoading && conversation.messages.length === 0 ? (

          <InternshipChatMessagesSkeleton embedded />

        ) : conversation.messages.length === 0 ? (

          <div className="isi-messages-empty">

            <p className="text-sm text-[var(--admin-text-muted)]">

              {t('student.announcements.chat.noMessages', { defaultValue: 'Aucun message pour le moment' })}

            </p>

          </div>

        ) : (

          conversation.messages.map((msg) => (

            <div key={msg.id} className="isi-msg-block">

              {msg.direction === 'in' ? (

                <div className="isi-msg isi-msg--in">

                  <div className="isi-bubble isi-bubble--in">{msg.text}</div>

                  <time className="isi-msg-time">{msg.time}</time>

                </div>

              ) : (

                <div className="isi-msg isi-msg--out">

                  <div className="isi-bubble isi-bubble--out">{msg.text}</div>

                  <InternshipMessageReadStatus

                    message={{

                      time: msg.time,

                      deliveryStatus: msg.deliveryStatus,

                      seenTime: msg.seenTime,

                    }}

                    seenLabel={

                      msg.seenTime

                        ? t('student.announcements.chat.seenAt', {

                            defaultValue: 'Vu à {{time}}',

                            time: msg.seenTime,

                          })

                        : undefined

                    }

                  />

                </div>

              )}

            </div>

          ))

        )}

        {peerTyping ? (

          <div className="isi-typing-indicator text-xs text-[var(--admin-text-muted)] px-4 pb-2">

            {t('student.announcements.chat.adminTyping', { defaultValue: "L'administrateur écrit…" })}

          </div>

        ) : null}

      </div>



      <SupportMessageComposer

        value={draft}

        onChange={setDraft}

        onSend={handleSend}

        onTyping={onTyping}

        placeholder={t('student.announcements.chat.composer')}

        inputAriaLabel={t('student.announcements.chat.composer')}

        sendAriaLabel={t('student.announcements.chat.sendMessage', {

          defaultValue: t('student.announcements.chat.send'),

        })}

        attachAriaLabel={t('student.announcements.chat.attachFile', { defaultValue: 'Joindre un fichier' })}

        showVoice={false}

      />

    </section>

  );

};



export default StudentAnnouncementChatArea;

