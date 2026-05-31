import { FunctionComponent, useCallback, useRef, useState } from 'react';
import { ClipboardPaste, ImagePlus, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ImageInsertModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (src: string) => void;
}

const ImageInsertModal: FunctionComponent<ImageInsertModalProps> = ({ open, onClose, onInsert }) => {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        onInsert(reader.result as string);
        onClose();
      };
      reader.readAsDataURL(file);
    },
    [onClose, onInsert],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  if (!open) return null;

  return (
    <div className="student-report-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="student-report-modal"
        role="dialog"
        aria-labelledby="image-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="student-report-modal__header">
          <div className="student-report-modal__icon">
            <ImagePlus className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 id="image-modal-title" className="student-report-modal__title">
              {t('student.reports.editor.imageModal.title')}
            </h2>
            <p className="student-report-modal__subtitle">{t('student.reports.editor.imageModal.subtitle')}</p>
          </div>
          <button type="button" className="student-report-modal__close" onClick={onClose} aria-label={t('student.reports.editor.imageModal.cancel')}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="student-report-modal__body">
          <div
            className={`student-report-image-dropzone ${dragOver ? 'is-dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-[var(--admin-brand)]" aria-hidden />
            <p className="student-report-image-dropzone__title">{t('student.reports.editor.imageModal.dropTitle')}</p>
            <p className="student-report-image-dropzone__hint">{t('student.reports.editor.imageModal.dropHint')}</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
                e.target.value = '';
              }}
            />
          </div>
          <p className="student-report-image-dropzone__paste">
            <ClipboardPaste className="inline h-3.5 w-3.5" aria-hidden />
            {' '}
            {t('student.reports.editor.imageModal.pasteHint')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageInsertModal;
