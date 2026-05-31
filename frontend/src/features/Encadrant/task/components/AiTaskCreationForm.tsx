import { FunctionComponent, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload } from 'lucide-react';
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
import {
  aiTaskGenerationBullets,
  aiTaskStudentsOptions,
} from '../data/aiTaskCreationMock';

const RequiredLabel: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
  <label className={AI_TASK_LABEL}>
    {children}
    <span className={AI_TASK_REQUIRED}> *</span>
  </label>
);

const AiTaskCreationForm: FunctionComponent = () => {
  const navigate = useNavigate();
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
          <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[#171717] sm:text-2xl">
            AI-Powered Task Creation
          </h1>
        </div>
        <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
          Upload a document and let AI generate tasks automatically
        </p>
      </header>

      <div className={AI_TASK_FIELD}>
        <RequiredLabel>Upload Document</RequiredLabel>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Upload document"
        />
        <button
          type="button"
          className={AI_TASK_UPLOAD_ZONE}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className={`h-8 w-8 sm:h-9 sm:w-9 ${AI_TASK_UPLOAD_ICON}`} strokeWidth={1.75} aria-hidden />
          <p className={AI_TASK_UPLOAD_TITLE}>
            {selectedFileName ?? 'Click to upload or drag and drop'}
          </p>
          <p className={AI_TASK_UPLOAD_SUBTEXT}>PDF, DOCX, TXT up to 10MB</p>
        </button>
      </div>

      <div className={AI_TASK_FIELD}>
        <RequiredLabel>Assign to Students</RequiredLabel>
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
        <p className={AI_TASK_HELPER}>Hold Ctrl/Cmd to select multiple students</p>
      </div>

      <aside className={AI_TASK_INFO_CARD} aria-label="How AI task generation works">
        <div className={AI_TASK_INFO_HEADER}>
          <span className={AI_TASK_INFO_ICON} aria-hidden>
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <h2 className={AI_TASK_INFO_TITLE}>How AI Task Generation Works</h2>
        </div>
        <ul className={AI_TASK_INFO_LIST}>
          {aiTaskGenerationBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>

      <div className={AI_TASK_ACTIONS_ROW}>
        <button
          type="button"
          className={AI_TASK_CANCEL_BTN}
          onClick={() => navigate(ENCADRANT_TASK_PATH)}
        >
          Cancel
        </button>
        <button type="submit" className={AI_TASK_SUBMIT_BTN}>
          <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Generate Tasks with AI
        </button>
      </div>
    </form>
  );
};

export default AiTaskCreationForm;
