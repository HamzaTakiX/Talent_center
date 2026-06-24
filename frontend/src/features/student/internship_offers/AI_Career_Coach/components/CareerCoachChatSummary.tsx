import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { ClipboardCheck, ClipboardList, Download, FileText, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CoachChatSummary, CoachSummaryCategory } from '../types/careerCoach';
import { sanitizeReportText, splitReportParagraphs } from '../utils/summaryText';
import CareerCoachSummarySkeleton from './CareerCoachSummarySkeleton';

interface CareerCoachChatSummaryProps {
  isOpen: boolean;
  hasMessages: boolean;
  summary: CoachChatSummary | null;
  isLoading: boolean;
  error: string | null;
  copied: boolean;
  isDownloading?: boolean;
  isPinnedReport?: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onCopy: () => void;
  onDownloadWord: () => void;
  onDownloadPdf: () => void;
}

const CATEGORY_KEYS: Record<CoachSummaryCategory, string> = {
  cv: 'student.internshipOffers.careerCoach.summary.categories.cv',
  internship: 'student.internshipOffers.careerCoach.summary.categories.internship',
  interview: 'student.internshipOffers.careerCoach.summary.categories.interview',
  career: 'student.internshipOffers.careerCoach.summary.categories.career',
  skills: 'student.internshipOffers.careerCoach.summary.categories.skills',
};

const CareerCoachChatSummary: FunctionComponent<CareerCoachChatSummaryProps> = ({
  isOpen,
  hasMessages,
  summary,
  isLoading,
  error,
  copied,
  isDownloading = false,
  isPinnedReport = false,
  onClose,
  onRefresh,
  onCopy,
  onDownloadWord,
  onDownloadPdf,
}) => {
  const { t } = useTranslation();
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!downloadMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!downloadMenuRef.current?.contains(event.target as Node)) {
        setDownloadMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [downloadMenuOpen]);

  useEffect(() => {
    if (!isOpen) setDownloadMenuOpen(false);
  }, [isOpen]);

  const categoryLabel = (category: string) => {
    const key = CATEGORY_KEYS[category as CoachSummaryCategory];
    return key ? t(key) : category;
  };

  const hasContent = Boolean(summary?.has_important_content);

  return (
    <aside
      id="sr-acc-summary-panel"
      className={`sr-acc-summary-drawer${isOpen ? ' sr-acc-summary-drawer--open' : ''}`}
      aria-label={t('student.internshipOffers.careerCoach.summary.panelAria')}
      aria-hidden={!isOpen}
    >
      <div className="sr-acc-summary-drawer__inner">
        <header className="sr-acc-summary-drawer__head">
          <div className="sr-acc-summary-drawer__head-copy">
            <h3 className="sr-acc-summary-drawer__title">
              {t('student.internshipOffers.careerCoach.summary.title')}
            </h3>
            <p className="sr-acc-summary-drawer__sub">
              {t('student.internshipOffers.careerCoach.summary.subtitle')}
            </p>
          </div>
          <div className="sr-acc-summary-drawer__actions">
            <button
              type="button"
              className="sr-acc-summary-drawer__icon-btn"
              onClick={onRefresh}
              disabled={isLoading || isPinnedReport}
              aria-label={t('student.internshipOffers.careerCoach.summary.refresh')}
              title={
                isPinnedReport
                  ? t('student.internshipOffers.careerCoach.summary.refreshPinnedHint')
                  : undefined
              }
            >
              <RefreshCw size={14} className={isLoading ? 'sr-acc-summary-drawer__spin' : ''} aria-hidden />
            </button>

            <div className="sr-acc-summary-drawer__download-wrap" ref={downloadMenuRef}>
              <button
                type="button"
                className={`sr-acc-summary-drawer__icon-btn${downloadMenuOpen ? ' sr-acc-summary-drawer__icon-btn--active' : ''}`}
                onClick={() => setDownloadMenuOpen((open) => !open)}
                disabled={!hasContent || isDownloading}
                aria-label={t('student.internshipOffers.careerCoach.summary.download')}
                aria-expanded={downloadMenuOpen}
                aria-haspopup="menu"
              >
                <Download size={14} className={isDownloading ? 'sr-acc-summary-drawer__spin' : ''} aria-hidden />
              </button>

              {downloadMenuOpen && (
                <div className="sr-acc-summary-drawer__download-menu" role="menu">
                  <button
                    type="button"
                    className="sr-acc-summary-drawer__download-item"
                    role="menuitem"
                    onClick={() => {
                      onDownloadPdf();
                      setDownloadMenuOpen(false);
                    }}
                  >
                    <FileText size={13} aria-hidden />
                    <span>{t('student.internshipOffers.careerCoach.summary.downloadPdf')}</span>
                  </button>
                  <button
                    type="button"
                    className="sr-acc-summary-drawer__download-item"
                    role="menuitem"
                    onClick={() => {
                      onDownloadWord();
                      setDownloadMenuOpen(false);
                    }}
                  >
                    <FileText size={13} aria-hidden />
                    <span>{t('student.internshipOffers.careerCoach.summary.downloadWord')}</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="sr-acc-summary-drawer__icon-btn"
              onClick={onCopy}
              disabled={!hasContent}
              aria-label={t('student.internshipOffers.careerCoach.summary.copy')}
            >
              {copied ? <ClipboardCheck size={14} aria-hidden /> : <ClipboardList size={14} aria-hidden />}
            </button>
            <button
              type="button"
              className="sr-acc-summary-drawer__icon-btn"
              onClick={onClose}
              aria-label={t('student.internshipOffers.careerCoach.summary.close')}
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        </header>

        <div className="sr-acc-summary-drawer__body">
          {isLoading && <CareerCoachSummarySkeleton />}

          {!isLoading && error && (
            <p className="sr-acc-summary-drawer__state sr-acc-summary-drawer__state--error" role="alert">
              {error}
            </p>
          )}

          {!isLoading && !error && summary && !summary.has_important_content && (
            <p className="sr-acc-summary-drawer__state">
              {t('student.internshipOffers.careerCoach.summary.emptyPinned')}
            </p>
          )}

          {!isLoading && !error && !summary && !hasMessages && (
            <p className="sr-acc-summary-drawer__state">
              {t('student.internshipOffers.careerCoach.summary.emptyNoMessages', {
                defaultValue: 'Aucun message pour le moment. Commencez la conversation pour afficher un resume.',
              })}
            </p>
          )}

          {!isLoading && !error && hasContent && summary && (
            <article className="sr-acc-summary-report">
              <header className="sr-acc-summary-report__head">
                <p className="sr-acc-summary-report__intro">
                  {isPinnedReport
                    ? t('student.internshipOffers.careerCoach.summary.pinnedIntro', {
                        count: summary.important_count,
                      })
                    : t('student.internshipOffers.careerCoach.summary.reportIntro', {
                        count: summary.important_count,
                      })}
                </p>
                {summary.key_topics.length > 0 && (
                  <div className="sr-acc-summary-report__topics">
                    {summary.key_topics.map((topic) => (
                      <span key={topic} className="sr-acc-summary-report__topic">
                        {categoryLabel(topic)}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <div className="sr-acc-summary-report__body">
                {summary.highlights.map((item, index) => (
                  <section
                    key={`${item.created_at}-${index}`}
                    className="sr-acc-summary-report__section"
                  >
                    <div className="sr-acc-summary-report__section-meta">
                      <span className="sr-acc-summary-report__index">{index + 1}</span>
                      <span className="sr-acc-summary-report__category">
                        {categoryLabel(item.category)}
                      </span>
                    </div>
                    <h4 className="sr-acc-summary-report__question">
                      {sanitizeReportText(item.question)}
                    </h4>
                    <div className="sr-acc-summary-report__answer">
                      {splitReportParagraphs(item.answer_preview).map((paragraph, pIndex) => (
                        <p key={pIndex}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CareerCoachChatSummary;
