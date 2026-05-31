import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import AgendaPageHeader from '../components/AgendaPageHeader';
import AgendaStatsGrid from '../components/AgendaStatsGrid';
import AgendaCalendarModule from '../components/AgendaCalendarModule';
import AgendaUpcomingPanel from '../components/AgendaUpcomingPanel';
import AgendaInternshipTimeline from '../components/AgendaInternshipTimeline';
import AgendaTasksKanban from '../components/AgendaTasksKanban';
import AgendaDeadlinesSection from '../components/AgendaDeadlinesSection';
import AgendaSupervisorMeetingsTable from '../components/AgendaSupervisorMeetingsTable';
import AgendaProgressSection from '../components/AgendaProgressSection';
import AgendaNotificationsPanel from '../components/AgendaNotificationsPanel';
import AgendaEventDetailModal from '../components/AgendaEventDetailModal';
import { AGENDA_PAGE_ROOT } from '../constants/agendaLayout';
import { useAgendaPlatform } from '../hooks/useAgendaPlatform';

const AgendaPage: FunctionComponent = () => {
  const platform = useAgendaPlatform();

  return (
    <StudentLayout>
      <div id="student-encadrant-agenda-root" className={AGENDA_PAGE_ROOT}>
        <AgendaPageHeader />
        <AgendaStatsGrid />

        <div className="student-agenda-platform__main">
          <AgendaCalendarModule
            loading={platform.loading}
            view={platform.view}
            onViewChange={platform.setView}
            rangeStart={platform.rangeStart}
            onRangeChange={platform.setRangeStart}
            shiftRange={platform.shiftRange}
            goToday={platform.goToday}
            eventsByDay={platform.eventsByDay}
            timelineEvents={platform.timelineEvents}
            onSelectEvent={platform.setSelectedEvent}
            formatDateKey={platform.formatDateKey}
            startOfWeek={platform.startOfWeek}
          />
          <AgendaUpcomingPanel
            events={platform.upcomingPanelEvents}
            onSelectEvent={platform.setSelectedEvent}
          />
        </div>

        <AgendaInternshipTimeline />

        <div className="student-agenda-two-col">
          <AgendaTasksKanban />
          <AgendaDeadlinesSection />
        </div>

        <AgendaSupervisorMeetingsTable />

        <div className="student-agenda-two-col">
          <AgendaProgressSection />
          <AgendaNotificationsPanel />
        </div>

        <AgendaEventDetailModal
          event={platform.selectedEvent}
          onClose={() => platform.setSelectedEvent(null)}
        />
      </div>
    </StudentLayout>
  );
};

export default AgendaPage;
