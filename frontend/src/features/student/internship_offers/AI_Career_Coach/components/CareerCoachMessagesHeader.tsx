import { FunctionComponent } from 'react';
import { Briefcase, ClipboardList, FileText, MessagesSquare, PanelLeft, ScanSearch, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CoachMode } from '../types/careerCoach';

const MODE_ICONS: Record<CoachMode, typeof Sparkles> = {
  'career-coach': Sparkles,
  'cv-reviewer': FileText,
  'ats-expert': ScanSearch,
  'interview-mentor': MessagesSquare,
  'internship-advisor': Briefcase,
};

interface CareerCoachMessagesHeaderProps {
  mode: CoachMode;
  isTyping: boolean;
  messageCount: number;
  summaryOpen: boolean;
  summaryHasNewContent: boolean;
  onSummaryToggle: () => void;
  mobileSidebarOpen?: boolean;
  onMobileSidebarToggle?: () => void;
}

const CareerCoachMessagesHeader: FunctionComponent<CareerCoachMessagesHeaderProps> = ({
  mode,
  isTyping,
  messageCount,
  summaryOpen,
  summaryHasNewContent,
  onSummaryToggle,
  mobileSidebarOpen = false,
  onMobileSidebarToggle,
}) => {
  const { t } = useTranslation();
  const ModeIcon = MODE_ICONS[mode];
  const modeLabel = t(`student.internshipOffers.careerCoach.modes.${mode}`);

  return (
    <header className="sr-acc-chat-panel__toolbar">
      <div className="sr-acc-chat-panel__toolbar-inner">
        <div className="sr-acc-chat-panel__toolbar-brand">
          <button
            type="button"
            className="sr-acc-chat-panel__sidebar-toggle"
            onClick={onMobileSidebarToggle}
            aria-expanded={mobileSidebarOpen}
            aria-controls="sr-acc-conversations-sidebar"
            aria-label={t('student.internshipOffers.careerCoach.history.openSidebar')}
          >
            <PanelLeft size={18} strokeWidth={2} aria-hidden />
          </button>
          <span className="sr-acc-chat-panel__toolbar-icon" aria-hidden>
            <ModeIcon size={14} strokeWidth={2.25} />
          </span>
          <div className="sr-acc-chat-panel__toolbar-copy">
            <h2 className="sr-acc-chat-panel__toolbar-title">{modeLabel}</h2>
            <p className="sr-acc-chat-panel__toolbar-sub">
              {t('student.internshipOffers.careerCoach.conversation.headerSubtitle')}
            </p>
          </div>
        </div>

        <div className="sr-acc-chat-panel__toolbar-meta">
          {messageCount > 0 && (
            <span className="sr-acc-chat-panel__toolbar-count">
              {t('student.internshipOffers.careerCoach.conversation.messageCount', {
                count: messageCount,
              })}
            </span>
          )}
          <span
            className={`sr-acc-chat-panel__toolbar-status${
              isTyping ? ' sr-acc-chat-panel__toolbar-status--active' : ''
            }`}
            role="status"
            aria-live="polite"
          >
            <span className="sr-acc-chat-panel__toolbar-status-dot" aria-hidden />
            {isTyping
              ? t('student.internshipOffers.careerCoach.conversation.thinking')
              : t('student.internshipOffers.careerCoach.conversation.statusReady')}
          </span>
          <button
            type="button"
            className={`sr-acc-chat-panel__summary-btn${
              summaryOpen ? ' sr-acc-chat-panel__summary-btn--active' : ''
            }${summaryHasNewContent && !summaryOpen ? ' sr-acc-chat-panel__summary-btn--pulse' : ''}`}
            onClick={onSummaryToggle}
            aria-expanded={summaryOpen}
            aria-controls="sr-acc-summary-panel"
            aria-label={t('student.internshipOffers.careerCoach.summary.toggle')}
          >
            <ClipboardList size={15} aria-hidden />
            <span>{t('student.internshipOffers.careerCoach.summary.toggleShort')}</span>
            {summaryHasNewContent && !summaryOpen && (
              <span className="sr-acc-chat-panel__summary-badge" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default CareerCoachMessagesHeader;
