import { FunctionComponent, type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  CircleDot,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  User,
  UserPlus,
} from 'lucide-react';
import type { InternshipConversation } from '../types/internshipChatTypes';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';
import InternshipOfferAvatar from './InternshipOfferAvatar';
import InternshipStudentAvatar from './InternshipStudentAvatar';
import InternshipAssignAdminModal from './InternshipAssignAdminModal';
import { applicationStatusPillClass } from '../utils/internshipChatStatusStyles';
import { conversationHasApplication } from '../utils/internshipChatDisplayUtils';
import { internshipApplicationPath } from '../utils/internshipChatNavigation';

type Props = {
  conversation: InternshipConversation | null;
  onAssignAdmin: (assigneeUserId: number) => Promise<void>;
  onViewStudent: () => void;
  onViewOffer: () => void;
};

function InspectorRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="isi-inspector-row">
      <div className="isi-inspector-row-icon" aria-hidden>
        {icon}
      </div>
      <div className="isi-inspector-row-content">
        <span className="isi-inspector-row-label">{label}</span>
        <div className="isi-inspector-row-value">{children}</div>
      </div>
    </div>
  );
}

const InternshipContextPanel: FunctionComponent<Props> = ({
  conversation,
  onAssignAdmin,
  onViewStudent,
  onViewOffer,
}) => {
  const navigate = useNavigate();
  const { t } = useInternshipInboxCopy();
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  if (!conversation) return null;

  const hasApplication = conversationHasApplication(conversation);
  const canViewStudent = Boolean(conversation.studentUserId);
  const canViewOffer = Boolean(conversation.offerUuid);
  const applicationPath = internshipApplicationPath(conversation);

  const goApplication = () => {
    if (applicationPath) navigate(applicationPath);
  };

  return (
    <>
      <aside className="isi-inspector">
        <header className="isi-inspector-head">
          <span className="isi-inspector-head-title">{t('contextTitle')}</span>
        </header>

        <div className="isi-inspector-section-title">{t('sections.student')}</div>
        <div className="isi-inspector-student-card">
          <InternshipStudentAvatar
            url={conversation.studentAvatarUrl}
            name={conversation.studentName}
            email={conversation.studentEmail}
            initials={conversation.studentInitials}
            size="inspector"
          />
          <div className="isi-inspector-student-card-copy min-w-0">
            <p className="isi-inspector-student-card-name">{conversation.studentName}</p>
            {conversation.studentEmail ? (
              <p className="isi-inspector-student-card-email">{conversation.studentEmail}</p>
            ) : null}
          </div>
        </div>
        <div className="isi-inspector-fields">
          <InspectorRow icon={<User className="size-3.5" />} label={t('fields.name')}>
            <span>{conversation.studentName}</span>
          </InspectorRow>
          <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.program')}>
            <span>{conversation.program}</span>
          </InspectorRow>
          <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.class')}>
            <span>{conversation.className}</span>
          </InspectorRow>
          {conversation.studentEmail ? (
            <InspectorRow icon={<Mail className="size-3.5" />} label={t('fields.email')}>
              <span>{conversation.studentEmail}</span>
            </InspectorRow>
          ) : null}
          {conversation.studentPhone ? (
            <InspectorRow icon={<Phone className="size-3.5" />} label={t('fields.phone')}>
              <span>{conversation.studentPhone}</span>
            </InspectorRow>
          ) : null}
        </div>

        <div className="isi-inspector-divider" />

        <div className="isi-inspector-section-title">{t('sections.currentOffer')}</div>
        <div className="isi-inspector-offer-card">
          <InternshipOfferAvatar
            url={conversation.companyLogoUrl}
            companyName={conversation.company}
            offerTitle={conversation.offerTitle}
            size="header"
          />
          <div className="isi-inspector-offer-card-copy min-w-0">
            <p className="isi-inspector-offer-card-company">{conversation.company}</p>
            <p className="isi-inspector-offer-card-title">{conversation.offerTitle}</p>
          </div>
        </div>
        <div className="isi-inspector-fields">
          <InspectorRow icon={<FileText className="size-3.5" />} label={t('fields.title')}>
            <span>{conversation.offerTitle}</span>
          </InspectorRow>
          <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.company')}>
            <span>{conversation.company}</span>
          </InspectorRow>
          <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.internshipType')}>
            <span>{conversation.internshipType}</span>
          </InspectorRow>
          <InspectorRow icon={<Clock className="size-3.5" />} label={t('fields.deadline')}>
            <span>{conversation.deadline}</span>
          </InspectorRow>
        </div>

        {hasApplication ? (
          <>
            <div className="isi-inspector-divider" />

            <div className="isi-inspector-section-title">{t('sections.application')}</div>
            <div className="isi-inspector-fields">
              <InspectorRow icon={<CircleDot className="size-3.5" />} label={t('fields.status')}>
                <span className={applicationStatusPillClass(conversation.applicationStatus)}>
                  {conversation.applicationStatus}
                </span>
              </InspectorRow>
              <InspectorRow icon={<Clock className="size-3.5" />} label={t('fields.appliedDate')}>
                <span>{conversation.appliedDate}</span>
              </InspectorRow>
              <InspectorRow icon={<Calendar className="size-3.5" />} label={t('fields.interview')}>
                <span>{conversation.interviewDate}</span>
              </InspectorRow>
              <InspectorRow icon={<Clock className="size-3.5" />} label={t('fields.lastChange')}>
                <span>{conversation.lastStatusChange}</span>
              </InspectorRow>
            </div>
          </>
        ) : null}

        <div className="isi-inspector-divider" />

        <div className="isi-inspector-actions">
          <span className="isi-inspector-actions-title">{t('sections.quickActions')}</span>
          <button
            type="button"
            className="isi-inspector-action isi-inspector-action--primary"
            onClick={() => setAssignModalOpen(true)}
          >
            <span className="isi-inspector-action-icon">
              <UserPlus className="size-3.5" />
            </span>
            <span className="isi-inspector-action-text">{t('quickActions.assignAdmin')}</span>
            <ChevronRight className="isi-inspector-action-chevron size-3.5" />
          </button>
          <button
            type="button"
            className="isi-inspector-action"
            onClick={onViewStudent}
            disabled={!canViewStudent}
          >
            <span className="isi-inspector-action-icon">
              <User className="size-3.5" />
            </span>
            <span className="isi-inspector-action-text">{t('viewStudent')}</span>
            <ChevronRight className="isi-inspector-action-chevron size-3.5" />
          </button>
          <button
            type="button"
            className="isi-inspector-action"
            onClick={goApplication}
            disabled={!applicationPath || !hasApplication}
          >
            <span className="isi-inspector-action-icon">
              <FileText className="size-3.5" />
            </span>
            <span className="isi-inspector-action-text">{t('viewApplication')}</span>
            <ChevronRight className="isi-inspector-action-chevron size-3.5" />
          </button>
          <button type="button" className="isi-inspector-action" onClick={onViewOffer} disabled={!canViewOffer}>
            <span className="isi-inspector-action-icon">
              <ExternalLink className="size-3.5" />
            </span>
            <span className="isi-inspector-action-text">{t('viewOffer')}</span>
            <ChevronRight className="isi-inspector-action-chevron size-3.5" />
          </button>
        </div>
      </aside>

      <InternshipAssignAdminModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={onAssignAdmin}
      />
    </>
  );
};

export default InternshipContextPanel;
