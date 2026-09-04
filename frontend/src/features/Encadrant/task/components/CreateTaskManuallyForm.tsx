import { FunctionComponent, useState, type ChangeEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ENCADRANT_TASK_PATH } from '../constants/routes';
import {
  CREATE_TASK_ACTIONS_ROW,
  CREATE_TASK_CANCEL_BTN,
  CREATE_TASK_DATE_WRAP,
  CREATE_TASK_FIELD,
  CREATE_TASK_FORM_CARD,
  CREATE_TASK_FORM_GRID,
  CREATE_TASK_HELPER,
  CREATE_TASK_INPUT,
  CREATE_TASK_LABEL,
  CREATE_TASK_REQUIRED,
  CREATE_TASK_SELECT,
  CREATE_TASK_SELECT_WRAP,
  CREATE_TASK_STUDENTS_SELECT,
  CREATE_TASK_SUBMIT_BTN,
  CREATE_TASK_TEXTAREA,
} from '../constants/createTaskManuallyLayout';
import { createTaskStudentsOptions } from '../data/createTaskManuallyMock';

const RequiredLabel: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
  <label className={CREATE_TASK_LABEL}>
    {children}
    <span className={CREATE_TASK_REQUIRED}> *</span>
  </label>
);

const CreateTaskManuallyForm: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const priorityOptions = [
    { value: '', label: t('encadrant.task.form.selectPriority') },
    { value: 'low', label: t('encadrant.task.priority.low') },
    { value: 'medium', label: t('encadrant.task.priority.medium') },
    { value: 'high', label: t('encadrant.task.priority.high') },
  ];

  const handleStudentsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedStudents(options);
  };

  return (
    <form
      className={CREATE_TASK_FORM_CARD}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <header className="flex min-w-0 flex-col gap-1">
        <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[var(--admin-text)] sm:text-2xl">
          {t('encadrant.task.form.title')}
        </h1>
        <p className="m-0 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
          {t('encadrant.task.form.subtitle')}
        </p>
      </header>

      <div className={CREATE_TASK_FIELD}>
        <RequiredLabel>{t('encadrant.task.form.taskTitle')}</RequiredLabel>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('encadrant.task.form.taskTitlePlaceholder')}
          className={CREATE_TASK_INPUT}
          required
        />
      </div>

      <div className={CREATE_TASK_FIELD}>
        <RequiredLabel>{t('encadrant.task.form.description')}</RequiredLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('encadrant.task.form.descriptionPlaceholder')}
          className={CREATE_TASK_TEXTAREA}
          required
        />
      </div>

      <div className={CREATE_TASK_FORM_GRID}>
        <div className={CREATE_TASK_FIELD}>
          <RequiredLabel>{t('encadrant.task.form.deadline')}</RequiredLabel>
          <div className={CREATE_TASK_DATE_WRAP}>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder={t('encadrant.task.form.deadlinePlaceholder')}
              className={`${CREATE_TASK_INPUT} pe-10`}
              required
            />
            <Calendar
              className="pointer-events-none absolute end-3 h-4 w-4 text-[var(--admin-text-secondary)]"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>

        <div className={CREATE_TASK_FIELD}>
          <RequiredLabel>{t('encadrant.task.form.priority')}</RequiredLabel>
          <div className={CREATE_TASK_SELECT_WRAP}>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={CREATE_TASK_SELECT}
              required
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value || 'placeholder'} value={opt.value} disabled={!opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-3 h-4 w-4 text-[var(--admin-text-secondary)]"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className={CREATE_TASK_FIELD}>
        <RequiredLabel>{t('encadrant.task.form.assignTo')}</RequiredLabel>
        <select
          multiple
          value={selectedStudents}
          onChange={handleStudentsChange}
          className={CREATE_TASK_STUDENTS_SELECT}
          required
        >
          {createTaskStudentsOptions.map((name) => (
            <option key={name} value={name} className="rounded px-2 py-1.5">
              {name}
            </option>
          ))}
        </select>
        <p className={CREATE_TASK_HELPER}>{t('encadrant.task.form.multiSelectHint')}</p>
      </div>

      <div className={CREATE_TASK_ACTIONS_ROW}>
        <button
          type="button"
          className={CREATE_TASK_CANCEL_BTN}
          onClick={() => navigate(ENCADRANT_TASK_PATH)}
        >
          {t('encadrant.common.cancel')}
        </button>
        <button type="submit" className={CREATE_TASK_SUBMIT_BTN}>
          <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          {t('encadrant.task.form.submit')}
        </button>
      </div>
    </form>
  );
};

export default CreateTaskManuallyForm;
