import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Eye, Video, CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { agendaSupervisorMeetings } from '../data/agendaPlatformMock';
import { AGENDA_GLASS_CARD, AGENDA_GHOST_BTN } from '../constants/agendaLayout';

const AgendaSupervisorMeetingsTable: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${AGENDA_GLASS_CARD} student-agenda-glass min-w-0`}>
      <div className="student-agenda-section-head">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.agenda.platform.meetings.title')}
        </h2>
      </div>
      <div className="student-agenda-table-wrap">
        <table className="student-agenda-table">
          <thead>
            <tr>
              <th>{t('student.encadrant.agenda.platform.meetings.columns.subject')}</th>
              <th>{t('student.encadrant.agenda.platform.meetings.columns.date')}</th>
              <th>{t('student.encadrant.agenda.platform.meetings.columns.time')}</th>
              <th>{t('student.encadrant.agenda.platform.meetings.columns.status')}</th>
              <th>{t('student.encadrant.agenda.platform.meetings.columns.type')}</th>
              <th>{t('student.encadrant.agenda.platform.meetings.columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {agendaSupervisorMeetings.map((row) => (
              <tr key={row.id}>
                <td className="font-medium">{t(row.subjectKey)}</td>
                <td>{row.date}</td>
                <td>{row.time}</td>
                <td>
                  <span className={`admin-badge student-agenda-status--${row.status}`}>
                    {t(`student.encadrant.agenda.platform.status.${row.status}`)}
                  </span>
                </td>
                <td className="text-[var(--admin-text-secondary)]">{t(row.meetingTypeKey)}</td>
                <td>
                  <div className="flex flex-wrap justify-center gap-1">
                    <button type="button" className={AGENDA_GHOST_BTN} title={t('student.encadrant.agenda.platform.actions.view')}>
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button type="button" className={AGENDA_GHOST_BTN} title={t('student.encadrant.agenda.joinMeeting')}>
                      <Video className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button type="button" className={AGENDA_GHOST_BTN} title={t('student.encadrant.agenda.platform.actions.reschedule')}>
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
};

export default AgendaSupervisorMeetingsTable;
