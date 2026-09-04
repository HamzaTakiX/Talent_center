import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, CalendarClock, Clock, Loader2, Trash2, Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import agendaApi from '../api/agendaApi';
import type {
  AgendaAvailabilityException,
  AgendaInterval,
  AgendaPerson,
} from '../types';
import {
  addDays,
  browserTimezone,
  fromLocalInputValue,
  startOfDay,
  toLocalInputValue,
} from '../utils/agendaRange';
import { toAgendaError } from '../utils/agendaErrors';
import { getAgendaLocale } from '../utils/calendarLocale';

interface RuleRow {
  weekday: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface AgendaAvailabilityModalProps {
  open: boolean;
  contacts: AgendaPerson[];
  onClose: () => void;
  /** Opens the create form pre-filled with the chosen slot. */
  onPickSlot: (slot: AgendaInterval) => void;
}

const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

function defaultRows(): RuleRow[] {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    startTime: DEFAULT_START,
    endTime: DEFAULT_END,
    enabled: weekday < 5,
  }));
}

/**
 * Working hours, one-off blocks, and suggested slots.
 *
 * The slot search runs on the server against everyone involved, so a suggestion
 * is one where *all* of them are actually free — the client never intersects
 * calendars itself.
 */
const AgendaAvailabilityModal: FunctionComponent<AgendaAvailabilityModalProps> = ({
  open,
  contacts,
  onClose,
  onPickSlot,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);

  const [rows, setRows] = useState<RuleRow[]>(defaultRows);
  const [exceptions, setExceptions] = useState<AgendaAvailabilityException[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const [slotWith, setSlotWith] = useState<number[]>([]);
  const [slotDuration, setSlotDuration] = useState(30);
  const [slots, setSlots] = useState<AgendaInterval[] | null>(null);
  const [searchingSlots, setSearchingSlots] = useState(false);

  const weekdayLabels = useMemo(() => {
    // 2024-01-01 was a Monday, which matches the backend's 0 = Monday.
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, i) =>
      addDays(monday, i).toLocaleDateString(locale, { weekday: 'long' }),
    );
  }, [locale]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    setSlots(null);

    const tomorrow = addDays(startOfDay(new Date()), 1);
    setBlockStart(toLocalInputValue(new Date(tomorrow.setHours(9, 0, 0, 0))));
    setBlockEnd(toLocalInputValue(new Date(tomorrow.setHours(12, 0, 0, 0))));

    agendaApi
      .getAvailability()
      .then((data) => {
        const byWeekday = new Map(data.rules.map((rule) => [rule.weekday, rule]));
        setRows(
          Array.from({ length: 7 }, (_, weekday) => {
            const rule = byWeekday.get(weekday);
            return {
              weekday,
              startTime: rule?.startTime?.slice(0, 5) ?? DEFAULT_START,
              endTime: rule?.endTime?.slice(0, 5) ?? DEFAULT_END,
              enabled: Boolean(rule),
            };
          }),
        );
        setExceptions(data.exceptions);
      })
      .catch((err) => {
        setError(toAgendaError(err, t('student.encadrant.agenda.platform.errors.load')).message);
      })
      .finally(() => setLoading(false));
  }, [open, t]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const patchRow = (weekday: number, patch: Partial<RuleRow>) => {
    setRows((prev) => prev.map((row) => (row.weekday === weekday ? { ...row, ...patch } : row)));
    setNotice(null);
  };

  const saveRules = useCallback(async () => {
    const invalid = rows.find((row) => row.enabled && row.endTime <= row.startTime);
    if (invalid) {
      setError(t('student.encadrant.agenda.platform.availability.errors.endBeforeStart'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await agendaApi.saveAvailability(
        rows
          .filter((row) => row.enabled)
          .map((row) => ({
            weekday: row.weekday,
            startTime: row.startTime,
            endTime: row.endTime,
            timezone: browserTimezone(),
          })),
      );
      setNotice(t('student.encadrant.agenda.platform.availability.saved'));
    } catch (err) {
      setError(
        toAgendaError(err, t('student.encadrant.agenda.platform.errors.update')).message,
      );
    } finally {
      setSaving(false);
    }
  }, [rows, t]);

  const addBlock = useCallback(async () => {
    const start = fromLocalInputValue(blockStart);
    const end = fromLocalInputValue(blockEnd);
    if (!start || !end || end.getTime() <= start.getTime()) {
      setError(t('student.encadrant.agenda.platform.availability.errors.endBeforeStart'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await agendaApi.addAvailabilityException({
        start: start.toISOString(),
        end: end.toISOString(),
        reason: blockReason.trim(),
      });
      const data = await agendaApi.getAvailability();
      setExceptions(data.exceptions);
      setBlockReason('');
      setNotice(t('student.encadrant.agenda.platform.availability.blockAdded'));
    } catch (err) {
      setError(toAgendaError(err, t('student.encadrant.agenda.platform.errors.create')).message);
    } finally {
      setSaving(false);
    }
  }, [blockStart, blockEnd, blockReason, t]);

  const removeBlock = useCallback(
    async (exceptionId: number) => {
      setError(null);
      try {
        await agendaApi.removeAvailabilityException(exceptionId);
        setExceptions((prev) => prev.filter((item) => item.id !== exceptionId));
      } catch (err) {
        setError(toAgendaError(err, t('student.encadrant.agenda.platform.errors.delete')).message);
      }
    },
    [t],
  );

  const findSlots = useCallback(async () => {
    setSearchingSlots(true);
    setError(null);
    try {
      const found = await agendaApi.suggestedSlots({
        start: new Date(),
        end: addDays(new Date(), 14),
        userIds: slotWith,
        durationMinutes: slotDuration,
        limit: 12,
      });
      setSlots(found);
    } catch (err) {
      setError(toAgendaError(err, t('student.encadrant.agenda.platform.errors.load')).message);
    } finally {
      setSearchingSlots(false);
    }
  }, [slotWith, slotDuration, t]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="student-agenda-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="student-agenda-modal agenda-form-modal agenda-form-modal--wide"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="agenda-availability-title"
          >
            <header className="agenda-form-modal__head">
              <div className="agenda-form-modal__identity">
                <span className="agenda-form-modal__badge" aria-hidden>
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <h2 id="agenda-availability-title" className="agenda-form-modal__title">
                    {t('student.encadrant.agenda.platform.availability.title')}
                  </h2>
                  <p className="agenda-form-modal__kicker">
                    {t('student.encadrant.agenda.platform.availability.kicker')}
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

            {loading ? (
              <div className="agenda-form-modal__body">
                <div className="student-agenda-skeleton h-6 w-40" />
                <div className="student-agenda-skeleton h-48 w-full" />
              </div>
            ) : (
              <div className="agenda-form">
                <div className="agenda-form-modal__body">
                <section className="agenda-form__panel">
                  <div className="agenda-form__panel-head">
                    <span className="agenda-form__panel-icon" aria-hidden>
                      <Clock className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="agenda-form__panel-title">
                        {t('student.encadrant.agenda.platform.availability.workingHours')}
                      </h3>
                      <p className="agenda-form__hint">
                        {t('student.encadrant.agenda.platform.availability.workingHoursHint', {
                          timezone: browserTimezone(),
                        })}
                      </p>
                    </div>
                  </div>
                  <ul className="agenda-avail__rules">
                    {rows.map((row) => (
                      <li
                        key={row.weekday}
                        className={`agenda-avail__rule ${row.enabled ? '' : 'is-off'}`}
                      >
                        <label className="agenda-avail__day">
                          <input
                            type="checkbox"
                            className="agenda-avail__check"
                            checked={row.enabled}
                            onChange={(e) => patchRow(row.weekday, { enabled: e.target.checked })}
                          />
                          <span>{weekdayLabels[row.weekday]}</span>
                        </label>
                        <input
                          type="time"
                          className="admin-input agenda-avail__time"
                          value={row.startTime}
                          disabled={!row.enabled}
                          onChange={(e) => patchRow(row.weekday, { startTime: e.target.value })}
                          aria-label={t('student.encadrant.agenda.platform.form.start')}
                        />
                        <span className="agenda-avail__sep" aria-hidden>
                          –
                        </span>
                        <input
                          type="time"
                          className="admin-input agenda-avail__time"
                          value={row.endTime}
                          disabled={!row.enabled}
                          onChange={(e) => patchRow(row.weekday, { endTime: e.target.value })}
                          aria-label={t('student.encadrant.agenda.platform.form.end')}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="agenda-form__actions">
                    <button
                      type="button"
                      className="ofative-btn ofative-btn--primary"
                      onClick={() => void saveRules()}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                      {t('student.encadrant.agenda.platform.availability.save')}
                    </button>
                  </div>
                </section>

                <section className="agenda-form__panel">
                  <div className="agenda-form__panel-head">
                    <span className="agenda-form__panel-icon" aria-hidden>
                      <Ban className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="agenda-form__panel-title">
                        {t('student.encadrant.agenda.platform.availability.blocks')}
                      </h3>
                    </div>
                  </div>
                  <div className="agenda-form__row">
                    <label className="agenda-form__field">
                      <span className="agenda-form__label">
                        {t('student.encadrant.agenda.platform.form.start')}
                      </span>
                      <input
                        type="datetime-local"
                        className="admin-input"
                        value={blockStart}
                        onChange={(e) => setBlockStart(e.target.value)}
                      />
                    </label>
                    <label className="agenda-form__field">
                      <span className="agenda-form__label">
                        {t('student.encadrant.agenda.platform.form.end')}
                      </span>
                      <input
                        type="datetime-local"
                        className="admin-input"
                        value={blockEnd}
                        onChange={(e) => setBlockEnd(e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="agenda-form__field">
                    <span className="agenda-form__label">
                      {t('student.encadrant.agenda.platform.availability.reason')}
                    </span>
                    <input
                      className="admin-input"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder={t(
                        'student.encadrant.agenda.platform.availability.reasonPlaceholder',
                      )}
                    />
                  </label>
                  <div className="agenda-form__actions">
                    <button
                      type="button"
                      className="ofative-btn ofative-btn--ghost"
                      onClick={() => void addBlock()}
                      disabled={saving}
                    >
                      {t('student.encadrant.agenda.platform.availability.addBlock')}
                    </button>
                  </div>

                  {exceptions.length > 0 ? (
                    <ul className="agenda-avail__blocks">
                      {exceptions.map((item) => (
                        <li key={item.id}>
                          <span>
                            {new Date(item.start).toLocaleString(locale, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                            {' – '}
                            {new Date(item.end).toLocaleTimeString(locale, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {item.reason ? ` · ${item.reason}` : ''}
                          </span>
                          <button
                            type="button"
                            className="ofative-icon-btn"
                            onClick={() => void removeBlock(item.id)}
                            aria-label={t('student.encadrant.agenda.platform.availability.removeBlock')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="agenda-form__hint">
                      {t('student.encadrant.agenda.platform.availability.noBlocks')}
                    </p>
                  )}
                </section>

                <section className="agenda-form__panel">
                  <div className="agenda-form__panel-head">
                    <span className="agenda-form__panel-icon" aria-hidden>
                      <Users className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="agenda-form__panel-title">
                        {t('student.encadrant.agenda.platform.availability.findSlots')}
                      </h3>
                    </div>
                  </div>
                  {contacts.length > 0 ? (
                    <div className="agenda-form__chips">
                      {contacts.map((person) => (
                        <label
                          key={person.userId}
                          className={`agenda-form__chip ${
                            slotWith.includes(person.userId) ? 'is-on' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={slotWith.includes(person.userId)}
                            onChange={() =>
                              setSlotWith((prev) =>
                                prev.includes(person.userId)
                                  ? prev.filter((id) => id !== person.userId)
                                  : [...prev, person.userId],
                              )
                            }
                          />
                          {person.name || person.email}
                        </label>
                      ))}
                    </div>
                  ) : null}
                  <div className="agenda-form__row">
                    <label className="agenda-form__field">
                      <span className="agenda-form__label">
                        {t('student.encadrant.agenda.platform.availability.duration')}
                      </span>
                      <select
                        className="admin-select"
                        value={slotDuration}
                        onChange={(e) => setSlotDuration(Number(e.target.value))}
                      >
                        {[15, 30, 45, 60, 90].map((minutes) => (
                          <option key={minutes} value={minutes}>
                            {t('student.encadrant.agenda.platform.form.reminderMinutes', {
                              count: minutes,
                            })}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="agenda-form__field">
                      <span className="agenda-form__label" aria-hidden>
                        {'\u00a0'}
                      </span>
                      <button
                        type="button"
                        className="ofative-btn ofative-btn--primary"
                        onClick={() => void findSlots()}
                        disabled={searchingSlots}
                      >
                        {searchingSlots ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <CalendarClock className="h-4 w-4" aria-hidden />
                        )}
                        {t('student.encadrant.agenda.platform.availability.search')}
                      </button>
                    </div>
                  </div>

                  {slots !== null ? (
                    slots.length === 0 ? (
                      <p className="agenda-form__hint">
                        {t('student.encadrant.agenda.platform.availability.noSlots')}
                      </p>
                    ) : (
                      <div className="agenda-form__chips">
                        {slots.map((slot) => (
                          <button
                            key={slot.start}
                            type="button"
                            className="agenda-form__chip"
                            onClick={() => onPickSlot(slot)}
                          >
                            {new Date(slot.start).toLocaleString(locale, {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </button>
                        ))}
                      </div>
                    )
                  ) : null}
                </section>

                {error ? (
                  <p className="agenda-form__error" role="alert">
                    {error}
                  </p>
                ) : null}
                {notice ? (
                  <p className="agenda-form__notice" role="status">
                    {notice}
                  </p>
                ) : null}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AgendaAvailabilityModal;
