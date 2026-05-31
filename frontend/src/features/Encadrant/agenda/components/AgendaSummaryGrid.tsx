import { FunctionComponent } from 'react';
import { AGENDA_STATS_GRID } from '../constants/agendaLayout';
import { agendaSummaryMock } from '../data';
import AgendaSummaryCard from './AgendaSummaryCard';

const AgendaSummaryGrid: FunctionComponent = () => (
  <section aria-label="Agenda summary" className={AGENDA_STATS_GRID}>
    {agendaSummaryMock.map((stat) => (
      <AgendaSummaryCard key={stat.label} stat={stat} />
    ))}
  </section>
);

export default AgendaSummaryGrid;
