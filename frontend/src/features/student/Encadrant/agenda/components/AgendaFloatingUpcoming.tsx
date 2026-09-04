import { FunctionComponent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AgendaPlatformEvent } from '../types';
import { getAgendaLocale } from '../utils/calendarLocale';

interface AgendaFloatingUpcomingProps {
  event: AgendaPlatformEvent | null;
  onSelect: (event: AgendaPlatformEvent) => void;
}

const AgendaFloatingUpcoming: FunctionComponent<AgendaFloatingUpcomingProps> = ({ event, onSelect }) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="ofative-floating"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        >
          <span className="ofative-floating__avatars" aria-hidden>
            {event.participants.slice(0, 2).map((person, index) => (
              <span
                key={person.userId}
                className={`ofative-floating__av ${index === 1 ? 'ofative-floating__av--2' : ''}`}
              >
                {(person.name || '?').trim().slice(0, 2).toUpperCase()}
              </span>
            ))}
            {event.participantCount > 2 ? (
              <span className="ofative-floating__more">+{event.participantCount - 2}</span>
            ) : null}
          </span>
          <button type="button" className="ofative-floating__main" onClick={() => onSelect(event)}>
            <span className="ofative-floating__icon" aria-hidden>
              <Video className="h-5 w-5" />
            </span>
            <span className="ofative-floating__text">
              <span className="ofative-floating__title">{event.title}</span>
              <span className="ofative-floating__sub">
                {t('student.encadrant.agenda.platform.ofative.upcomingEvent')}
                {' · '}
                {new Date(event.startAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AgendaFloatingUpcoming;
