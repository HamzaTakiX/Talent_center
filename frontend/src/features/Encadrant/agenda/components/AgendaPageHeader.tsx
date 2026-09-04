import { FunctionComponent } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AGENDA_PAGE_HEADER, AGENDA_PRIMARY_BTN } from '../constants/agendaLayout';
import { MeetingActionButton } from '../../../shared/meeting-room';

const AgendaPageHeader: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <header className={AGENDA_PAGE_HEADER}>
      <div className="min-w-0 flex-1">
        <h1 className="m-0 text-xl font-semibold leading-7 tracking-tight text-[var(--admin-text)] sm:text-2xl">
          {t('encadrant.header.titles.agenda')}
        </h1>
        <p className="m-0 mt-1 text-sm font-normal leading-5 text-[var(--admin-text-secondary)]">
          {t('encadrant.agenda.description')}
        </p>
      </div>
      <MeetingActionButton
        portal="encadrant"
        mode="video"
        title={t('encadrant.dashboard.meetings.startMeeting')}
        className={AGENDA_PRIMARY_BTN}
      >
        <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        {t('encadrant.dashboard.meetings.startMeeting')}
      </MeetingActionButton>
    </header>
  );
};

export default AgendaPageHeader;
