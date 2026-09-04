import { FunctionComponent, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ENCADRANT_TASK_PATH } from '../constants/routes';
import {
  AI_TASK_ACTIONS_ROW,
  AI_TASK_CANCEL_BTN,
  AI_TASK_FIELD,
  AI_TASK_FORM_CARD,
  AI_TASK_HEADER_ICON,
  AI_TASK_HEADER_ROW,
  AI_TASK_HEADER_TITLE_ROW,
  AI_TASK_HELPER,
  AI_TASK_INFO_CARD,
  AI_TASK_INFO_HEADER,
  AI_TASK_INFO_ICON,
  AI_TASK_INFO_LIST,
  AI_TASK_INFO_TITLE,
  AI_TASK_LABEL,
  AI_TASK_REQUIRED,
  AI_TASK_STUDENTS_SELECT,
  AI_TASK_SUBMIT_BTN,
  AI_TASK_UPLOAD_ICON,
  AI_TASK_UPLOAD_SUBTEXT,
  AI_TASK_UPLOAD_TITLE,
  AI_TASK_UPLOAD_ZONE,
} from '../constants/aiTaskCreationLayout';
import { aiTaskStudentsOptions } from '../data/aiTaskCreationMock';

const RequiredLabel: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
  <label className={AI_TASK_LABEL}>
    {children}
    <span className={AI_TASK_REQUIRED}> *</span>
  </label>
);

const AI_BULLET_KEYS = [
  'encadrant.task.ai.bullets.one',
  'encadrant.task.ai.bullets.two',
  'encadrant.task.ai.bullets.three',
  'encadrant.task.ai.bullets.four',
] as const;

const AiTaskCreationForm: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleStudentsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedStudents(options);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFileName(file?.name ?? null);
  };

  return (
    <form
      className={AI_TASK_FORM_CARD}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <header className={AI_TASK_HEADER_ROW}>
        <div className={AI_TASK_HEADER_TITLE_ROW}>
          <span className={AI_TASK_HEADER_ICON} aria-hidden>
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
          </span>
          <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[var(--admin-text)] sm:text-2xl">
            {t('encadrant.task.ai.title')}
          </h1>
        </div>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
          {t('encadrant.task.ai.subtitle')}
        </p>
      </header>

      <div className={AI_TASK_FIELD}>
        <RequiredLabel>{t('encadrant.task.ai.upload')}</RequiredLabel>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="sr-only"
          onChange={handleFileChange}
          aria-label={t('encadrant.task.ai.upload')}
        />
        <button
          type="button"
          className={AI_TASK_UPLOAD_ZONE}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={`h-8 w-8 sm:h-9 sm:w-9 ${AI_TASK_UPLOAD_ICON}`} strokeWidth={1.75} aria-hidden />
          <p className={AI_TASK_UPLOAD_TITLE}>
            {selectedFileName ?? t('encadrant.task.ai.uploadHint')}
          </p>
          <p className={AI_TASK_UPLOAD_SUBTEXT}>{t('encadrant.task.ai.formats')}</p>
        </button>
      </div>

      <div className={AI_TASK_FIELD}>
        <RequiredLabel>{t('encadrant.task.form.assignTo')}</RequiredLabel>
        <select
          multiple
          value={selectedStudents}
          onChange={handleStudentsChange}
          className={AI_TASK_STUDENTS_SELECT}
          required
        >
          {aiTaskStudentsOptions.map((name) => (
            <option key={name} value={name} className="rounded px-2 py-1.5">
              {name}
            </option>
          ))}
        </select>
        <p className={AI_TASK_HELPER}>{t('encadrant.task.form.multiSelectHint')}</p>
      </div>

      <aside className={AI_TASK_INFO_CARD} aria-label={t('encadrant.task.ai.howItWorks')}>
        <div className={AI_TASK_INFO_HEADER}>
          <span className={AI_TASK_INFO_ICON} aria-hidden>
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <h2 className={AI_TASK_INFO_TITLE}>{t('encadrant.task.ai.howItWorks')}</h2>
        </div>
        <ul className={AI_TASK_INFO_LIST}>
          {AI_BULLET_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </aside>

      <div className={AI_TASK_ACTIONS_ROW}>
        <button
          type="button"
          className={AI_TASK_CANCEL_BTN}
          onClick={() => navigate(ENCADRANT_TASK_PATH)}
        >
          {t('encadrant.common.cancel')}
        </button>
        <button type="submit" className={AI_TASK_SUBMIT_BTN}>
          <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          {t('encadrant.task.ai.generate')}
        </button>
      </div>
    </form>
  );
};

export default AiTaskCreationForm;
