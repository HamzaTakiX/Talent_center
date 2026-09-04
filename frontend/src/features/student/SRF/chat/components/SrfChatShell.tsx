import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import SupportInboxShell, {
  type SupportInboxLayoutProps,
} from '../../../../admin/shared/admin-support-inbox/components/SupportInboxShell';
import {
  InternshipChatContextPanelSkeleton,
  InternshipChatWorkspaceSkeleton,
} from '../../../../admin/offres-stage/chat/components/InternshipChatLoadingSkeletons';
import StudentLayout from '../../../components/StudentLayout';
import { formatMad } from '../../utils/formatMad';
import { useStudentSrfChat } from '../hooks/useStudentSrfChat';
import SrfChatThread from './SrfChatThread';
import StudentSrfConversationList from './StudentSrfConversationList';
import StudentSrfFinancialContextPanel from './StudentSrfFinancialContextPanel';

type PaymentAskLocationState = {
  paymentAsk?: {
    installmentId?: number;
    feeType: string;
    dueDate: string;
    amountRemaining: number;
  };
};

const StudentSrfChatLayout: FunctionComponent<SupportInboxLayoutProps> = ({
  children,
  mainFillHeight,
}) => (
  <StudentLayout mainFillHeight={mainFillHeight} contentFlush>
    {children}
  </StudentLayout>
);

const SrfChatShell: FunctionComponent = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const chat = useStudentSrfChat();

  const initialDraft = useMemo(() => {
    const paymentAsk = (location.state as PaymentAskLocationState | null)?.paymentAsk;
    if (!paymentAsk) return '';
    return t('student.srf.chat.paymentAskDraft', {
      feeType: paymentAsk.feeType,
      dueDate: paymentAsk.dueDate,
      amount: formatMad(paymentAsk.amountRemaining),
    });
  }, [location.state, t]);

  const hasSelection = Boolean(chat.conversationId) || chat.loading;
  const isOpeningConversation = chat.loading && !chat.conversationId;

  const workspace = isOpeningConversation ? (
    <InternshipChatWorkspaceSkeleton />
  ) : (
    <SrfChatThread
      messages={chat.messages}
      loading={chat.loading}
      loadError={chat.loadError}
      archived={chat.archived}
      initialDraft={initialDraft}
      onSend={(text, tagCodes, entityRefs) => void chat.sendMessage(text, tagCodes, entityRefs)}
      onArchive={() => void chat.archiveConversation()}
      onUnarchive={() => void chat.unarchiveConversation()}
      onBack={() => chat.setMobileView('list')}
    />
  );

  return (
    <SupportInboxShell
      Layout={StudentSrfChatLayout}
      hasSelection={hasSelection}
      mobileView={chat.mobileView}
      sidebar={
        <StudentSrfConversationList
          loading={chat.loading && !chat.conversationId}
          loadError={chat.loadError}
          lastPreview={chat.lastPreview}
          lastMessageIsOwn={chat.lastMessageIsOwn}
          timeLabel={chat.timeLabel}
          unreadCount={chat.unreadCount}
          selected={Boolean(chat.conversationId)}
          onSelect={() => chat.setMobileView('chat')}
        />
      }
      workspace={workspace}
      contextPanel={
        chat.conversationId ? (
          <StudentSrfFinancialContextPanel
            financialSummary={chat.sidebar.financialSummary}
            obligations={chat.sidebar.obligations}
            upcomingDeadline={chat.sidebar.upcomingDeadline}
          />
        ) : isOpeningConversation ? (
          <InternshipChatContextPanelSkeleton />
        ) : undefined
      }
    />
  );
};

export default SrfChatShell;
