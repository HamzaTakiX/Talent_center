import { FunctionComponent, useEffect, useRef } from 'react';
import { ExternalLink, Link2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LinkInsertModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string, newTab: boolean) => void;
  initialText?: string;
}

const LinkInsertModal: FunctionComponent<LinkInsertModalProps> = ({
  open,
  onClose,
  onInsert,
  initialText = '',
}) => {
  const { t } = useTranslation();
  const urlRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const newTabRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => urlRef.current?.focus(), 50);
      if (textRef.current) textRef.current.value = initialText;
    }
  }, [open, initialText]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlRef.current?.value.trim();
    if (!url) return;
    onInsert(url, textRef.current?.value ?? '', newTabRef.current?.checked ?? false);
    onClose();
  };

  return (
    <div className="student-report-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="student-report-modal"
        role="dialog"
        aria-labelledby="link-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="student-report-modal__header">
          <div className="student-report-modal__icon">
            <Link2 className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 id="link-modal-title" className="student-report-modal__title">
              {t('student.reports.editor.linkModal.title')}
            </h2>
            <p className="student-report-modal__subtitle">{t('student.reports.editor.linkModal.subtitle')}</p>
          </div>
          <button type="button" className="student-report-modal__close" onClick={onClose} aria-label={t('student.reports.editor.linkModal.cancel')}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <form className="student-report-modal__body" onSubmit={handleSubmit}>
          <label className="student-report-modal__field">
            <span>{t('student.reports.editor.linkModal.url')}</span>
            <input ref={urlRef} type="url" required placeholder="https://" className="student-report-modal__input" />
          </label>
          <label className="student-report-modal__field">
            <span>{t('student.reports.editor.linkModal.displayText')}</span>
            <input ref={textRef} type="text" placeholder={t('student.reports.editor.linkModal.displayTextPlaceholder')} className="student-report-modal__input" />
          </label>
          <label className="student-report-modal__checkbox">
            <input ref={newTabRef} type="checkbox" defaultChecked />
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            {t('student.reports.editor.linkModal.openNewTab')}
          </label>
          <div className="student-report-modal__actions">
            <button type="button" className="student-report-modal__btn student-report-modal__btn--ghost" onClick={onClose}>
              {t('student.reports.editor.linkModal.cancel')}
            </button>
            <button type="submit" className="student-report-modal__btn student-report-modal__btn--primary">
              {t('student.reports.editor.linkModal.insert')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkInsertModal;
