import { DragEvent, FormEvent, FunctionComponent, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUp, Paperclip, Send, X } from 'lucide-react';

interface CareerCoachComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  pendingAttachment: File | null;
  onClearAttachment: () => void;
  onFileSelect: (files: FileList | null) => void;
  isDragging: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  disabled?: boolean;
}

const CareerCoachComposer: FunctionComponent<CareerCoachComposerProps> = ({
  value,
  onChange,
  onSend,
  pendingAttachment,
  onClearAttachment,
  onFileSelect,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSend();
  };

  return (
    <div
      className={`sr-acc-composer${isDragging ? ' sr-acc-composer--dragging' : ''}${
        disabled ? ' sr-acc-composer--disabled' : ''
      }`}
      onDragOver={disabled ? undefined : onDragOver}
      onDragLeave={disabled ? undefined : onDragLeave}
      onDrop={disabled ? undefined : onDrop}
      aria-busy={disabled}
    >
      {isDragging && (
        <div className="sr-acc-composer__dropzone">
          <FileUp className="h-5 w-5" aria-hidden />
          {t('student.internshipOffers.careerCoach.composer.dropHere')}
        </div>
      )}

      {pendingAttachment && (
        <div className="sr-acc-composer__attachment">
          <Paperclip className="h-3.5 w-3.5" aria-hidden />
          <span className="truncate">{pendingAttachment.name}</span>
          <button type="button" onClick={onClearAttachment} aria-label={t('student.internshipOffers.careerCoach.composer.removeFile')}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <form className="sr-acc-composer__form" onSubmit={handleSubmit}>
        <input
          ref={fileRef}
          type="file"
          className="sr-acc-composer__file-input"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => onFileSelect(e.target.files)}
          aria-hidden
          tabIndex={-1}
        />
        <button
          type="button"
          className="sr-acc-composer__icon-btn"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          aria-label={t('student.internshipOffers.careerCoach.composer.attach')}
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          type="text"
          className="sr-acc-composer__input"
          placeholder={
            disabled
              ? t('student.internshipOffers.careerCoach.composer.preparing')
              : t('student.internshipOffers.careerCoach.composer.placeholder')
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={t('student.internshipOffers.careerCoach.composer.placeholder')}
        />
        <button
          type="submit"
          className="sr-acc-composer__send"
          disabled={disabled || (!value.trim() && !pendingAttachment)}
          aria-label={t('student.internshipOffers.careerCoach.composer.placeholder')}
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
};

export default CareerCoachComposer;
