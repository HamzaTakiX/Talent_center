import { FunctionComponent, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Video, Calendar, Clock, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { MeetingEmptyState } from '../../../../shared/meeting-room';
import { AGENDA_CATEGORY_CLASS } from '../constants/eventCategories';
import { AGENDA_PRIORITY_CLASS } from '../constants/agendaPriorities';
import { AGENDA_GLASS_CARD, AGENDA_GHOST_BTN, AGENDA_PRIMARY_BTN } from '../constants/agendaLayout';
import { AgendaMeetingJoinButton } from '../../../../shared/meeting-room';
import type { AgendaPlatformEvent } from '../types';
import { getAgendaLocale } from '../utils/calendarLocale';

type UpcomingViewMode = 'list' | 'grid';

interface AgendaUpcomingPanelProps {
  events: AgendaPlatformEvent[];
  onSelectEvent: (event: AgendaPlatformEvent) => void;
}

interface AgendaUpcomingEventCardProps {
  event: AgendaPlatformEvent;
  index: number;
  viewMode: UpcomingViewMode;
  locale: string;
  onSelectEvent: (event: AgendaPlatformEvent) => void;
}

const AgendaUpcomingEventCard: FunctionComponent<AgendaUpcomingEventCardProps> = ({
  event,
  index,
  viewMode,
  locale,
  onSelectEvent,
}) => {
  const { t } = useTranslation();
  const startDate = new Date(event.startAt);
  const isGrid = viewMode === 'grid';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.005 }}
      data-category={event.category}
      className={`student-agenda-upcoming-card student-agenda-upcoming-card--${viewMode}`}
    >
      <div className="student-agenda-upcoming-card__glow" aria-hidden />

      {isGrid ? (
        <div className="student-agenda-upcoming-card__date-chip">
          <span className="student-agenda-upcoming-card__date-day">
            {startDate.toLocaleDateString(locale, { day: '2-digit' })}
          </span>
          <span className="student-agenda-upcoming-card__date-month">
            {startDate.toLocaleDateString(locale, { month: 'short' })}
          </span>
        </div>
      ) : null}

      <div className="student-agenda-upcoming-card__body">
        <div className="student-agenda-upcoming-card__tags">
          <span className={`admin-badge ${AGENDA_CATEGORY_CLASS[event.category]}`}>
            {t(`student.encadrant.agenda.platform.categories.${event.category}`)}
          </span>
          <span className={`admin-badge student-agenda-status--${event.status}`}>
            {t(`student.encadrant.agenda.platform.status.${event.status}`)}
          </span>
          {event.priority ? (
            <span className={`admin-badge ${AGENDA_PRIORITY_CLASS[event.priority]}`}>
              {t(`student.encadrant.agenda.priorities.${event.priority}`)}
            </span>
          ) : null}
        </div>

        <h3 className="student-agenda-upcoming-card__title">{event.title}</h3>

        {event.description ? (
          <p className={`student-agenda-upcoming-card__desc ${isGrid ? 'line-clamp-2' : ''}`}>
            {event.description}
          </p>
        ) : null}

        {!isGrid && event.organizerName ? (
          <p className="student-agenda-upcoming-card__organizer">
            {t('student.encadrant.agenda.platform.modal.organizer')}: {event.organizerName}
          </p>
        ) : null}

        <div className="student-agenda-upcoming-card__meta">
          {!isGrid ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {startDate.toLocaleDateString(locale, { dateStyle: 'medium' })}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {startDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={`student-agenda-upcoming-card__actions ${isGrid ? 'student-agenda-upcoming-card__actions--compact' : ''}`}>
          {event.showJoin ? (
            <AgendaMeetingJoinButton
              portal="student"
              mode="video"
              meetingId={event.meetingId}
              startAt={event.startAt}
              title={event.title}
              className={AGENDA_PRIMARY_BTN}
            >
              <Video className="h-3.5 w-3.5" aria-hidden />
              {t('student.encadrant.agenda.joinMeeting')}
            </AgendaMeetingJoinButton>
          ) : null}
          <button type="button" className={AGENDA_GHOST_BTN} onClick={() => onSelectEvent(event)}>
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {!isGrid ? t('student.encadrant.agenda.platform.actions.viewDetails') : null}
          </button>
        </div>
      </div>
    </motion.article>
  );
};

const AgendaUpcomingPanel: FunctionComponent<AgendaUpcomingPanelProps> = ({
  events,
  onSelectEvent,
}) => {
  const { t, i18n } = useTranslation();
  const locale = getAgendaLocale(i18n.language);
  const [viewMode, setViewMode] = useState<UpcomingViewMode>('list');

  return (
    <motion.section
      {...fadeInUp}
      transition={{ delay: 0.08 }}
      className={`${AGENDA_GLASS_CARD} student-agenda-glass student-agenda-upcoming-panel w-full min-w-0`}
    >
      <div className="student-agenda-upcoming-panel__orb student-agenda-upcoming-panel__orb--one" aria-hidden />
      <div className="student-agenda-upcoming-panel__orb student-agenda-upcoming-panel__orb--two" aria-hidden />

      <div className="student-agenda-section-head student-agenda-upcoming-panel__head">
        <div className="min-w-0">
          <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
            {t('student.encadrant.agenda.upcoming')}
          </h2>
          <span className="admin-badge admin-badge--neutral mt-2 inline-flex">
            {t('student.encadrant.agenda.eventCount', { count: events.length })}
          </span>
        </div>

        <div
          className="student-agenda-view-tabs"
          role="tablist"
          aria-label={t('student.encadrant.agenda.viewMode')}
        >
          {(['list', 'grid'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={viewMode === mode}
              aria-label={t(`student.encadrant.agenda.views.${mode}`)}
              title={t(`student.encadrant.agenda.views.${mode}`)}
              className={`student-agenda-view-tab ${viewMode === mode ? 'is-active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'list' ? (
                <List className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
              )}
              <span className="hidden sm:inline">{t(`student.encadrant.agenda.views.${mode}`)}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className={`student-agenda-upcoming-panel__list p-4 sm:p-5 ${
          viewMode === 'grid' ? 'student-agenda-upcoming-panel__list--grid' : ''
        }`}
      >
        {events.length === 0 ? (
          <MeetingEmptyState context="noUpcoming" variant="inline" />
        ) : (
          events.map((event, index) => (
            <AgendaUpcomingEventCard
              key={event.id}
              event={event}
              index={index}
              viewMode={viewMode}
              locale={locale}
              onSelectEvent={onSelectEvent}
            />
          ))
        )}
      </div>
    </motion.section>
  );
};

export default AgendaUpcomingPanel;
