import { FunctionComponent } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import AgendaCalendarCard from '../components/AgendaCalendarCard';
import AgendaEventsSection from '../components/AgendaEventsSection';
import { AGENDA_MAIN_GRID, AGENDA_PAGE_ROOT } from '../constants/agendaLayout';

const AgendaPage: FunctionComponent = () => (
  <StudentLayout headerTitle="Encadrant" headerSubtitle="Digital Talent Center">
    <div id="student-encadrant-agenda-root" className={AGENDA_PAGE_ROOT}>
      <div className={AGENDA_MAIN_GRID}>
        <AgendaCalendarCard />
        <AgendaEventsSection />
      </div>
    </div>
  </StudentLayout>
);

export default AgendaPage;
