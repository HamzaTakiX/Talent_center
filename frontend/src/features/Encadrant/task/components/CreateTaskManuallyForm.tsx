import { FunctionComponent, useState, type ChangeEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Check, ChevronDown } from 'lucide-react';
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
import {
  createTaskPriorityOptions,
  createTaskStudentsOptions,
} from '../data/createTaskManuallyMock';

const RequiredLabel: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
  <label className={CREATE_TASK_LABEL}>
    {children}
    <span className={CREATE_TASK_REQUIRED}> *</span>
  </label>
);

const CreateTaskManuallyForm: FunctionComponent = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

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
        <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[#171717] sm:text-2xl">
          Create Task Manually
        </h1>
        <p className="m-0 text-sm font-normal leading-5 text-[#717182]">
          Add a new task and assign it to students
        </p>
      </header>

      <div className={CREATE_TASK_FIELD}>
        <RequiredLabel>Task Title</RequiredLabel>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Complete Database Schema Design"
          className={CREATE_TASK_INPUT}
          required
        />
      </div>

      <div className={CREATE_TASK_FIELD}>
        <RequiredLabel>Description</RequiredLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task in detail, include requirements and expected deliverables..."
          className={CREATE_TASK_TEXTAREA}
          required
        />
      </div>

      <div className={CREATE_TASK_FORM_GRID}>
        <div className={CREATE_TASK_FIELD}>
          <RequiredLabel>Deadline</RequiredLabel>
          <div className={CREATE_TASK_DATE_WRAP}>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="jj/mm/aaaa"
              className={`${CREATE_TASK_INPUT} pr-10`}
              required
            />
            <Calendar
              className="pointer-events-none absolute right-3 h-4 w-4 text-[#717182]"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>

        <div className={CREATE_TASK_FIELD}>
          <RequiredLabel>Priority</RequiredLabel>
          <div className={CREATE_TASK_SELECT_WRAP}>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={CREATE_TASK_SELECT}
              required
            >
              {createTaskPriorityOptions.map((opt) => (
                <option key={opt.value || 'placeholder'} value={opt.value} disabled={!opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 h-4 w-4 text-[#717182]"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className={CREATE_TASK_FIELD}>
        <RequiredLabel>Assign to Students</RequiredLabel>
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
        <p className={CREATE_TASK_HELPER}>Hold Ctrl/Cmd to select multiple students</p>
      </div>

      <div className={CREATE_TASK_ACTIONS_ROW}>
        <button
          type="button"
          className={CREATE_TASK_CANCEL_BTN}
          onClick={() => navigate(ENCADRANT_TASK_PATH)}
        >
          Cancel
        </button>
        <button type="submit" className={CREATE_TASK_SUBMIT_BTN}>
          <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Create Task
        </button>
      </div>
    </form>
  );
};

export default CreateTaskManuallyForm;
