import { FunctionComponent } from 'react';
import EncadrantLayout from '../../components/EncadrantLayout';
import { AgendaCalendarSection, AgendaPageHeader, AgendaSummaryGrid } from '../components';
import { AGENDA_PAGE_ROOT } from '../constants/agendaLayout';

const AgendaPage: FunctionComponent = () => (
  <EncadrantLayout>
    <div id="encadrant-agenda-root" className={AGENDA_PAGE_ROOT}>
      <AgendaPageHeader />
      <AgendaSummaryGrid />
      <AgendaCalendarSection />
    </div>
  </EncadrantLayout>
);

export default AgendaPage;
