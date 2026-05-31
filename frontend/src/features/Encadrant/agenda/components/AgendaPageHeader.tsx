import { FunctionComponent } from 'react';
import { Plus } from 'lucide-react';
import { AGENDA_PAGE_HEADER, AGENDA_PRIMARY_BTN } from '../constants/agendaLayout';

const AgendaPageHeader: FunctionComponent = () => (
  <header className={AGENDA_PAGE_HEADER}>
    <div className="min-w-0 flex-1">
      <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[#171717] sm:text-2xl">
        Agenda
      </h1>
      <p className="m-0 mt-1 text-sm font-normal leading-5 text-[#717182]">
        Manage your meetings and schedule
      </p>
    </div>
    <button type="button" className={AGENDA_PRIMARY_BTN}>
      <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      Schedule Meeting
    </button>
  </header>
);

export default AgendaPageHeader;
