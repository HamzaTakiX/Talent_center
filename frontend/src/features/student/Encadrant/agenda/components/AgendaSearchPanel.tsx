import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import agendaApi from '../api/agendaApi';
import { AGENDA_CATEGORY_CLASS, AGENDA_CATEGORY_DOT_CLASS } from '../constants/eventCategories';
import type { AgendaPlatformEvent } from '../types';
import { isAbort, toAgendaError } from '../utils/agendaErrors';
import { getAgendaLocale } from '../utils/calendarLocale';

interface AgendaSearchPanelProps {
  open: boolean;
  onClose: () => void;
  onSelectEvent: (event: AgendaPlatformEvent) => void;
}

/**
 * Backend-driven search across the whole calendar.
 *
 * Deliberately not filtered from the loaded window: the point is to reach
 * events outside the current view, and the paginated endpoint keeps that from
 * turning into "download everything".
 */
const AgendaSearchPanel: FunctionComponent<AgendaSearchPanelProps> = ({
  open,
  onClose,
  onSelectEvent,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AgendaPlatformEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      return undefined;
    }
    setQuery('');
    setResults([]);
    setTotal(0);
    setError(null);
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setTotal(0);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      setError(null);
      agendaApi
        .search({ q: term, includeCancelled: true, sort: '-start' }, 1, 25, controller.signal)
        .then((page) => {
          setResults(page.events);
          setTotal(page.total);
        })
        .catch((err) => {
          if (isAbort(err)) return;
          setError(
            toAgendaError(err, t('student.encadrant.agenda.platform.errors.load')).message,
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, t]);

  const pick = useCallback(
    (event: AgendaPlatformEvent) => {
      onSelectEvent(event);
      onClose();
    },
    [onSelectEvent, onClose],
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="student-agenda-modal-backdrop agenda-search-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="agenda-search-panel"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t('student.encadrant.agenda.platform.ofative.search')}
          >
            <div className="agenda-search-panel__bar">
              <span className="agenda-search-panel__icon" aria-hidden>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </span>
              <input
                ref={inputRef}
                type="text"
                role="searchbox"
                className="agenda-search-panel__input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('student.encadrant.agenda.platform.search.placeholder')}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="agenda-search-panel__kbd">Esc</kbd>
              <button
                type="button"
                className="ofative-icon-btn shrink-0"
                onClick={onClose}
                aria-label={t('student.encadrant.agenda.platform.close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="agenda-search-panel__body">
              {error ? (
                <div className="agenda-search-panel__empty">
                  <p className="agenda-form__error" role="alert">
                    {error}
                  </p>
                </div>
              ) : query.trim().length < 2 ? (
                <div className="agenda-search-panel__empty">
                  <span className="agenda-search-panel__empty-icon" aria-hidden>
                    <Search className="h-5 w-5" />
                  </span>
                  <p className="agenda-form__hint">
                    {t('student.encadrant.agenda.platform.search.hint')}
                  </p>
                </div>
              ) : results.length === 0 && !searching ? (
                <div className="agenda-search-panel__empty">
                  <span className="agenda-search-panel__empty-icon" aria-hidden>
                    <Search className="h-5 w-5" />
                  </span>
                  <p className="agenda-form__hint">
                    {t('student.encadrant.agenda.platform.search.noResults')}
                  </p>
                </div>
              ) : (
                <>
                  <p className="agenda-search-panel__count">
                    {t('student.encadrant.agenda.platform.search.count', { count: total })}
                  </p>
                  <ul className="agenda-search-panel__list">
                    {results.map((event) => (
                      <li key={event.occurrenceId}>
                        <button
                          type="button"
                          className="agenda-search-panel__item"
                          onClick={() => pick(event)}
                        >
                          <span
                            className={`agenda-search-panel__dot ${AGENDA_CATEGORY_DOT_CLASS[event.category]}`}
                            aria-hidden
                          />
                          <span className="agenda-search-panel__text">
                            <span className="agenda-search-panel__title">{event.title}</span>
                            <span className="agenda-search-panel__meta">
                              {new Date(event.startAt).toLocaleString(locale, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                              {event.organizerName ? ` · ${event.organizerName}` : ''}
                            </span>
                          </span>
                          <span
                            className={`agenda-search-panel__badge ${AGENDA_CATEGORY_CLASS[event.category] ?? ''}`}
                          >
                            {t(
                              `student.encadrant.agenda.platform.categories.${event.category}`,
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AgendaSearchPanel;
