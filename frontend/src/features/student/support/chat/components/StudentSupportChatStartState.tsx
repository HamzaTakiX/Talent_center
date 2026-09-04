import { FunctionComponent } from 'react';
import { ArrowUpRight, Info, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { STUDENT_ANNOUNCEMENTS_CHAT_PATH } from '../../../Annoucements/chat/constants/routes';
import { STUDENT_DOCUMENTS_CHAT_PATH } from '../../../Documents/constants/routes';
import { STUDENT_ENCADRANT_CHAT_PATH } from '../../../Encadrant/constants/routes';
import { STUDENT_CHAT_PATH } from '../../../internship_offers/chat/constants/routes';
import { STUDENT_SRF_CHAT_PATH } from '../../../SRF/constants/routes';
import type { PlatformDeskConversation } from '../../../../admin/shared/platform-desk-chat/types/platformDeskChatTypes';

type Props = {
  conversation: PlatformDeskConversation;
};

const HERE_TOPIC_KEYS = ['profile', 'access', 'routing', 'followUp'] as const;

const REDIRECT_MODULES = [
  { key: 'offers', path: STUDENT_CHAT_PATH },
  { key: 'documents', path: STUDENT_DOCUMENTS_CHAT_PATH },
  { key: 'srf', path: STUDENT_SRF_CHAT_PATH },
  { key: 'encadrant', path: STUDENT_ENCADRANT_CHAT_PATH },
  { key: 'announcements', path: STUDENT_ANNOUNCEMENTS_CHAT_PATH },
] as const;

const StudentSupportChatStartState: FunctionComponent<Props> = ({ conversation }) => {
  const { t } = useTranslation();
  const prefix = 'student.support.chat.startChat';
  const adminName = conversation.displayName?.trim() || t(`${prefix}.fallbackAdmin`);

  return (
    <div className="isi-start-chat" role="note">
      <div className="isi-start-chat-card">
        <header className="isi-start-chat-head">
          <span className="isi-start-chat-badge" aria-hidden>
            <Shield className="size-3.5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="isi-start-chat-kicker">{t(`${prefix}.kicker`)}</p>
            <h3 className="isi-start-chat-title">{t(`${prefix}.title`, { admin: adminName })}</h3>
          </div>
        </header>

        <p className="isi-start-chat-intro">{t(`${prefix}.intro`, { admin: adminName })}</p>

        <section className="isi-start-chat-section">
          <h4 className="isi-start-chat-section-title">{t(`${prefix}.hereTitle`)}</h4>
          <ul className="isi-start-chat-list">
            {HERE_TOPIC_KEYS.map((key) => (
              <li key={key}>{t(`${prefix}.hereTopics.${key}`)}</li>
            ))}
          </ul>
        </section>

        <section className="isi-start-chat-section isi-start-chat-section--muted">
          <h4 className="isi-start-chat-section-title">
            <Info className="isi-start-chat-section-icon size-3.5" strokeWidth={2} aria-hidden />
            {t(`${prefix}.elsewhereTitle`)}
          </h4>
          <ul className="isi-start-chat-redirects">
            {REDIRECT_MODULES.map(({ key, path }) => (
              <li key={key}>
                <Link to={path} className="isi-start-chat-link">
                  <span>{t(`${prefix}.elsewhere.${key}.label`)}</span>
                  <ArrowUpRight className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
                </Link>
                <p className="isi-start-chat-redirect-desc">{t(`${prefix}.elsewhere.${key}.desc`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="isi-start-chat-footer">{t(`${prefix}.footer`)}</p>
      </div>
    </div>
  );
};

export default StudentSupportChatStartState;
