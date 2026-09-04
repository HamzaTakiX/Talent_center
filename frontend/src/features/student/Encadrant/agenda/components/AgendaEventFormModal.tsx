import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CalendarPlus, Loader2, Pencil, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import agendaApi from '../api/agendaApi';
import {
  AGENDA_CATEGORY_DOT_CLASS,
  AGENDA_CATEGORY_TO_TYPE,
  AGENDA_LEGEND_CATEGORIES,
} from '../constants/eventCategories';
import type {
  AgendaConflict,
  AgendaEventCategory,
  AgendaEventInput,
  AgendaPerson,
  AgendaPlatformEvent,
  AgendaRecurrenceFrequency,
  AgendaSeriesScope,
} from '../types';
import {
  addMinutes,
  browserTimezone,
  fromLocalInputValue,
  toLocalInputValue,
} from '../utils/agendaRange';
import type { AgendaMutationResult } from '../hooks/useAgendaPlatform';
import { getAgendaLocale } from '../utils/calendarLocale';

const REMINDER_PRESETS = [5, 15, 30, 60, 1440];
const FREQUENCIES: AgendaRecurrenceFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

function personInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface AgendaEventDraft {
  /** Present when editing; absent when creating. */
  event?: AgendaPlatformEvent;
  start?: Date;
  end?: Date;
}

interface AgendaEventFormModalProps {
  draft: AgendaEventDraft | null;
  contacts: AgendaPerson[];
  reminderPresets?: number[];
  onClose: () => void;
  onSubmit: (input: AgendaEventInput, event?: AgendaPlatformEvent) => Promise<AgendaMutationResult>;
}

interface FormState {
  title: string;
  description: string;
  category: AgendaEventCategory;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  isOnline: boolean;
  participants: number[];
  reminders: number[];
  recurring: boolean;
  frequency: AgendaRecurrenceFrequency;
  interval: number;
  count: string;
  scope: AgendaSeriesScope;
}

function initialState(draft: AgendaEventDraft): FormState {
  const event = draft.event;
  if (event) {
    return {
      title: event.title,
      description: event.description,
      category: event.category,
      start: toLocalInputValue(new Date(event.startAt)),
      end: toLocalInputValue(new Date(event.endAt)),
      allDay: event.allDay,
      location: event.location,
      isOnline: event.isOnline,
      participants: event.participants.filter((p) => !p.isOrganizer).map((p) => p.userId),
      reminders: event.reminders?.map((r) => r.minutesBefore) ?? [],
      recurring: Boolean(event.recurrence),
      frequency: event.recurrence?.frequency ?? 'WEEKLY',
      interval: event.recurrence?.interval ?? 1,
      count: event.recurrence?.count ? String(event.recurrence.count) : '',
      scope: 'this',
    };
  }

  const start = draft.start ?? addMinutes(new Date(), 30 - (new Date().getMinutes() % 30));
  const end = draft.end ?? addMinutes(start, 60);
  return {
    title: '',
    description: '',
    category: 'meeting',
    start: toLocalInputValue(start),
    end: toLocalInputValue(end),
    allDay: false,
    location: '',
    isOnline: false,
    participants: [],
    reminders: [15],
    recurring: false,
    frequency: 'WEEKLY',
    interval: 1,
    count: '',
    scope: 'this',
  };
}

/**
 * Create / edit form for a calendar event.
 *
 * Participants come from `/agenda/contacts` — the exact set the caller may
 * invite — rather than a general user directory, and conflicts are probed
 * before submitting so the overlap warning arrives before the write, not as an
 * error afterwards. The server re-checks both regardless.
 */
const AgendaEventFormModal: FunctionComponent<AgendaEventFormModalProps> = ({
  draft,
  contacts,
  reminderPresets = REMINDER_PRESETS,
  onClose,
  onSubmit,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);
  const isEdit = Boolean(draft?.event);

  const [form, setForm] = useState<FormState>(() => initialState(draft ?? {}));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<AgendaConflict[] | null>(null);
  const [allowConflicts, setAllowConflicts] = useState(false);

  useEffect(() => {
    if (!draft) return;
    setForm(initialState(draft));
    setError(null);
    setConflicts(null);
    setAllowConflicts(false);
  }, [draft]);

  useEffect(() => {
    if (!draft) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [draft, onClose]);

  const patch = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setConflicts(null);
    setAllowConflicts(false);
  }, []);

  /**
   * Keep the duration when the start moves.
   *
   * Nudging the start of a one-hour meeting should not silently turn it into a
   * three-hour one.
   */
  const onStartChange = useCallback(
    (value: string) => {
      const nextStart = fromLocalInputValue(value);
      const prevStart = fromLocalInputValue(form.start);
      const prevEnd = fromLocalInputValue(form.end);
      if (!nextStart || !prevStart || !prevEnd) {
        patch('start', value);
        return;
      }
      const minutes = Math.max(15, Math.round((prevEnd.getTime() - prevStart.getTime()) / 60_000));
      setForm((prev) => ({
        ...prev,
        start: value,
        end: toLocalInputValue(addMinutes(nextStart, minutes)),
      }));
      setConflicts(null);
      setAllowConflicts(false);
    },
    [form.start, form.end, patch],
  );

  const bounds = useMemo(() => {
    const start = fromLocalInputValue(form.start);
    const end = fromLocalInputValue(form.end);
    return { start, end };
  }, [form.start, form.end]);

  const invalidRange = Boolean(
    bounds.start && bounds.end && bounds.end.getTime() <= bounds.start.getTime(),
  );

  const buildInput = useCallback((): AgendaEventInput => {
    const input: AgendaEventInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      eventType: AGENDA_CATEGORY_TO_TYPE[form.category],
      start: bounds.start?.toISOString(),
      end: bounds.end?.toISOString(),
      timezone: browserTimezone(),
      allDay: form.allDay,
      location: form.location.trim(),
      isOnline: form.isOnline,
      reminders: form.reminders.map((minutesBefore) => ({ minutesBefore })),
      allowConflicts: allowConflicts || undefined,
    };

    if (!isEdit) {
      input.participantUserIds = form.participants;
      input.recurrence = form.recurring
        ? {
            frequency: form.frequency,
            interval: Math.max(1, form.interval),
            count: form.count ? Number(form.count) : null,
          }
        : null;
    } else if (draft?.event?.isRecurring) {
      input.scope = form.scope;
      input.occurrenceStart = draft.event.occurrenceStart;
    }
    return input;
  }, [form, bounds, allowConflicts, isEdit, draft]);

  const probeConflicts = useCallback(async () => {
    if (!bounds.start || !bounds.end || invalidRange) return null;
    try {
      const report = await agendaApi.checkConflicts({
        start: bounds.start.toISOString(),
        end: bounds.end.toISOString(),
        timezone: browserTimezone(),
        participantUserIds: isEdit ? undefined : form.participants,
        excludeEventId: draft?.event?.id,
      });
      return report.hasBlockingConflicts ? report.conflicts : null;
    } catch {
      // A failed probe must not block the write; the server checks again.
      return null;
    }
  }, [bounds, invalidRange, isEdit, form.participants, draft]);

  const submit = useCallback(async () => {
    if (!form.title.trim()) {
      setError(t('student.encadrant.agenda.platform.form.errors.titleRequired'));
      return;
    }
    if (invalidRange) {
      setError(t('student.encadrant.agenda.platform.form.errors.endBeforeStart'));
      return;
    }

    setSubmitting(true);
    setError(null);

    if (!allowConflicts) {
      const found = await probeConflicts();
      if (found && found.length > 0) {
        setConflicts(found);
        setSubmitting(false);
        return;
      }
    }

    const result = await onSubmit(buildInput(), draft?.event);
    setSubmitting(false);

    if (result.ok) {
      onClose();
      return;
    }
    if (result.error?.conflicts?.length) {
      setConflicts(result.error.conflicts);
      return;
    }
    setError(result.error?.message ?? t('student.encadrant.agenda.platform.errors.create'));
  }, [
    form.title,
    invalidRange,
    allowConflicts,
    probeConflicts,
    onSubmit,
    buildInput,
    draft,
    onClose,
    t,
  ]);

  const toggleReminder = (minutes: number) => {
    setForm((prev) => ({
      ...prev,
      reminders: prev.reminders.includes(minutes)
        ? prev.reminders.filter((m) => m !== minutes)
        : [...prev.reminders, minutes],
    }));
  };

  const toggleParticipant = (userId: number) => {
    setForm((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((id) => id !== userId)
        : [...prev.participants, userId],
    }));
    setConflicts(null);
    setAllowConflicts(false);
  };

  const reminderLabel = (minutes: number) =>
    minutes >= 1440
      ? t('student.encadrant.agenda.platform.form.reminderDays', { count: minutes / 1440 })
      : minutes >= 60
        ? t('student.encadrant.agenda.platform.form.reminderHours', { count: minutes / 60 })
        : t('student.encadrant.agenda.platform.form.reminderMinutes', { count: minutes });

  return (
    <AnimatePresence>
      {draft ? (
        <motion.div
          className="student-agenda-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="student-agenda-modal agenda-form-modal"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-form-title"
          >
            <header className="agenda-form-modal__head">
              <div className="agenda-form-modal__identity">
                <span className="agenda-form-modal__badge" aria-hidden>
                  {isEdit ? <Pencil className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
                </span>
                <div>
                  <h2 id="agenda-form-title" className="agenda-form-modal__title">
                    {isEdit
                      ? t('student.encadrant.agenda.platform.form.editTitle')
                      : t('student.encadrant.agenda.platform.form.createTitle')}
                  </h2>
                  <p className="agenda-form-modal__kicker">
                    {isEdit
                      ? t('student.encadrant.agenda.platform.form.editKicker')
                      : t('student.encadrant.agenda.platform.form.createKicker')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="ofative-icon-btn shrink-0"
                onClick={onClose}
                aria-label={t('student.encadrant.agenda.platform.close')}
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <form
              className="agenda-form"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <div className="agenda-form-modal__body">
              <label className="agenda-form__field">
                <span className="agenda-form__label">
                  {t('student.encadrant.agenda.platform.form.title')}
                </span>
                <input
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => patch('title', e.target.value)}
                  placeholder={t('student.encadrant.agenda.platform.form.titlePlaceholder')}
                  required
                  autoFocus
                />
              </label>

              <fieldset className="agenda-form__group">
                <legend className="agenda-form__label">
                  {t('student.encadrant.agenda.platform.form.type')}
                </legend>
                <div className="agenda-form__types" role="radiogroup">
                  {AGENDA_LEGEND_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      role="radio"
                      aria-checked={form.category === category}
                      className={`agenda-form__type ${form.category === category ? 'is-on' : ''}`}
                      onClick={() => patch('category', category)}
                    >
                      <span
                        className={`agenda-form__type-dot ${AGENDA_CATEGORY_DOT_CLASS[category] ?? ''}`}
                        aria-hidden
                      />
                      {t(`student.encadrant.agenda.platform.categories.${category}`)}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="agenda-form__row">
                <label className="agenda-form__field">
                  <span className="agenda-form__label">
                    {t('student.encadrant.agenda.platform.form.start')}
                  </span>
                  <input
                    type="datetime-local"
                    className="admin-input"
                    value={form.start}
                    onChange={(e) => onStartChange(e.target.value)}
                    required
                  />
                </label>
                <label className="agenda-form__field">
                  <span className="agenda-form__label">
                    {t('student.encadrant.agenda.platform.form.end')}
                  </span>
                  <input
                    type="datetime-local"
                    className="admin-input"
                    value={form.end}
                    onChange={(e) => patch('end', e.target.value)}
                    aria-invalid={invalidRange}
                    required
                  />
                </label>
              </div>

              {invalidRange ? (
                <p className="agenda-form__error" role="alert">
                  {t('student.encadrant.agenda.platform.form.errors.endBeforeStart')}
                </p>
              ) : null}

              <div className="agenda-form__options">
                <label className="agenda-form__switch">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.allDay}
                    onChange={(e) => patch('allDay', e.target.checked)}
                  />
                  <span className="agenda-form__switch-track" aria-hidden />
                  <span>{t('student.encadrant.agenda.platform.form.allDay')}</span>
                </label>
                <label className="agenda-form__switch">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.isOnline}
                    onChange={(e) => patch('isOnline', e.target.checked)}
                  />
                  <span className="agenda-form__switch-track" aria-hidden />
                  <span>{t('student.encadrant.agenda.platform.form.online')}</span>
                </label>
                {!isEdit ? (
                  <label className="agenda-form__switch">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.recurring}
                      onChange={(e) => patch('recurring', e.target.checked)}
                    />
                    <span className="agenda-form__switch-track" aria-hidden />
                    <span>{t('student.encadrant.agenda.platform.form.repeat')}</span>
                  </label>
                ) : null}
              </div>

              <label className="agenda-form__field">
                <span className="agenda-form__label">
                  {t('student.encadrant.agenda.platform.form.location')}
                </span>
                <input
                  className="admin-input"
                  value={form.location}
                  onChange={(e) => patch('location', e.target.value)}
                  placeholder={t('student.encadrant.agenda.platform.form.locationPlaceholder')}
                  disabled={form.isOnline}
                />
              </label>

              <label className="agenda-form__field">
                <span className="agenda-form__label">
                  {t('student.encadrant.agenda.platform.form.description')}
                </span>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => patch('description', e.target.value)}
                />
              </label>

              {!isEdit ? (
                <fieldset className="agenda-form__group">
                  <legend className="agenda-form__label">
                    {t('student.encadrant.agenda.platform.form.participants')}
                  </legend>
                  {contacts.length === 0 ? (
                    <p className="agenda-form__hint">
                      {t('student.encadrant.agenda.platform.form.noContacts')}
                    </p>
                  ) : (
                    <div className="agenda-form__chips">
                      {contacts.map((person) => (
                        <label
                          key={person.userId}
                          className={`agenda-form__chip ${
                            form.participants.includes(person.userId) ? 'is-on' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={form.participants.includes(person.userId)}
                            onChange={() => toggleParticipant(person.userId)}
                          />
                          <span className="agenda-form__chip-av" aria-hidden>
                            {personInitials(person.name || person.email)}
                          </span>
                          {person.name || person.email}
                        </label>
                      ))}
                    </div>
                  )}
                </fieldset>
              ) : null}

              <fieldset className="agenda-form__group">
                <legend className="agenda-form__label">
                  {t('student.encadrant.agenda.platform.form.reminders')}
                </legend>
                <div className="agenda-form__chips">
                  {reminderPresets.map((minutes) => (
                    <label
                      key={minutes}
                      className={`agenda-form__chip ${
                        form.reminders.includes(minutes) ? 'is-on' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={form.reminders.includes(minutes)}
                        onChange={() => toggleReminder(minutes)}
                      />
                      {reminderLabel(minutes)}
                    </label>
                  ))}
                </div>
              </fieldset>

              {!isEdit && form.recurring ? (
                <div className="agenda-form__row">
                  <label className="agenda-form__field">
                    <span className="agenda-form__label">
                      {t('student.encadrant.agenda.platform.form.frequency')}
                    </span>
                    <select
                      className="admin-select"
                      value={form.frequency}
                      onChange={(e) =>
                        patch('frequency', e.target.value as AgendaRecurrenceFrequency)
                      }
                    >
                      {FREQUENCIES.map((freq) => (
                        <option key={freq} value={freq}>
                          {t(
                            `student.encadrant.agenda.platform.form.frequencies.${freq.toLowerCase()}`,
                          )}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="agenda-form__field">
                    <span className="agenda-form__label">
                      {t('student.encadrant.agenda.platform.form.occurrences')}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      className="admin-input"
                      value={form.count}
                      onChange={(e) => patch('count', e.target.value)}
                      placeholder={t('student.encadrant.agenda.platform.form.noEnd')}
                    />
                  </label>
                </div>
              ) : null}

              {isEdit && draft?.event?.isRecurring ? (
                <label className="agenda-form__field">
                  <span className="agenda-form__label">
                    {t('student.encadrant.agenda.platform.form.applyTo')}
                  </span>
                  <select
                    className="admin-select"
                    value={form.scope}
                    onChange={(e) => patch('scope', e.target.value as AgendaSeriesScope)}
                  >
                    <option value="this">
                      {t('student.encadrant.agenda.platform.form.scopes.this')}
                    </option>
                    <option value="following">
                      {t('student.encadrant.agenda.platform.form.scopes.following')}
                    </option>
                    <option value="series">
                      {t('student.encadrant.agenda.platform.form.scopes.series')}
                    </option>
                  </select>
                </label>
              ) : null}

              {conflicts?.length ? (
                <div className="agenda-form__conflict" role="alert">
                  <p className="agenda-form__conflict-head">
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
                    {t('student.encadrant.agenda.platform.form.conflictTitle')}
                  </p>
                  <ul className="agenda-form__conflict-list">
                    {conflicts.slice(0, 4).map((conflict) => (
                      <li key={`${conflict.eventId}-${conflict.userId}-${conflict.start}`}>
                        {conflict.title}
                        {' · '}
                        {new Date(conflict.start).toLocaleString(locale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </li>
                    ))}
                  </ul>
                  <label className="agenda-form__switch">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={allowConflicts}
                      onChange={(e) => setAllowConflicts(e.target.checked)}
                    />
                    <span className="agenda-form__switch-track" aria-hidden />
                    <span>{t('student.encadrant.agenda.platform.form.scheduleAnyway')}</span>
                  </label>
                </div>
              ) : null}

              {error ? (
                <p className="agenda-form__error" role="alert">
                  {error}
                </p>
              ) : null}
              </div>

              <div className="agenda-form-modal__foot">
                <button type="button" className="ofative-btn ofative-btn--ghost" onClick={onClose}>
                  {t('student.encadrant.agenda.platform.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="ofative-btn ofative-btn--primary"
                  disabled={submitting || invalidRange}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  {isEdit
                    ? t('student.encadrant.agenda.platform.form.save')
                    : t('student.encadrant.agenda.platform.form.create')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AgendaEventFormModal;
