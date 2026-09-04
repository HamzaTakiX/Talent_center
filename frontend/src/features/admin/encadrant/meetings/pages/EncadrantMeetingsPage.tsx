import { FunctionComponent, useMemo, useState } from 'react';

import AdminModulePageShell from '../../../ui/AdminModulePageShell';

import AdminModulePageSkeleton from '../../../ui/AdminModulePageSkeleton';

import MeetingsOverviewHeader from '../components/MeetingsOverviewHeader';

import MeetingsKpiGrid from '../components/MeetingsKpiGrid';

import MeetingsAlertsBanner from '../components/MeetingsAlertsBanner';

import MeetingsAnalyticsPanel from '../components/MeetingsAnalyticsPanel';

import MeetingsInsightsPanel from '../components/MeetingsInsightsPanel';

import MeetingsCalendarPanel from '../components/MeetingsCalendarPanel';

import MeetingsFiltersBar from '../components/MeetingsFiltersBar';

import MeetingsTableSection from '../components/MeetingsTableSection';

import EncadrantSupervisionOverview from '../components/EncadrantSupervisionOverview';

import {

  useSupervisionMeetingsCalendar,

  useSupervisionMeetingsDashboard,

  useSupervisionMeetingsList,

} from '../hooks/useSupervisionMeetings';

import type { CalendarViewMode, SupervisionMeetingListParams } from '../types/supervisionMeeting';

import '../styles/admin-meetings.css';



function monthRange(d: Date): { start: string; end: string } {

  const start = new Date(d.getFullYear(), d.getMonth(), 1);

  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

  return {

    start: start.toISOString().slice(0, 10),

    end: end.toISOString().slice(0, 10),

  };

}



const EncadrantMeetingsPage: FunctionComponent = () => {

  const [calendarView, setCalendarView] = useState<CalendarViewMode>('month');

  const [rangeStart, setRangeStart] = useState(() => new Date());

  const [filters, setFilters] = useState<SupervisionMeetingListParams>({ page: 1, page_size: 15 });



  const { summary, alerts, encadrantOverview, loading: dashLoading } = useSupervisionMeetingsDashboard();

  const { items, pagination, loading: listLoading } = useSupervisionMeetingsList(filters);

  const { start, end } = useMemo(() => monthRange(rangeStart), [rangeStart]);

  const { events, loading: calLoading } = useSupervisionMeetingsCalendar(start, end);



  const isInitial = dashLoading && !summary;

  const hasSearch = Boolean(

    filters.search?.trim() || filters.status || filters.meeting_type || filters.date_from || filters.date_to,

  );



  if (isInitial) {

    return (

      <AdminModulePageShell width="wide">

        <AdminModulePageSkeleton />

      </AdminModulePageShell>

    );

  }



  return (

    <AdminModulePageShell width="wide">

      <div className="admin-meetings-workspace" data-admin-search-id="encadrant-meetings">

        <MeetingsOverviewHeader summary={summary} loading={dashLoading} />

        <MeetingsKpiGrid summary={summary} loading={dashLoading} />

        <MeetingsAlertsBanner alerts={alerts} />



        <div className="admin-meetings-ops-grid">

          <MeetingsCalendarPanel

            events={events}

            loading={calLoading}

            view={calendarView}

            onViewChange={setCalendarView}

            rangeStart={rangeStart}

            onRangeChange={setRangeStart}

          />

          <aside className="admin-meetings-ops-aside">

            <MeetingsAnalyticsPanel summary={summary} loading={dashLoading} />

            <MeetingsInsightsPanel

              summary={summary}

              alerts={alerts}

              encadrantRows={encadrantOverview}

            />

          </aside>

        </div>



        <section className="admin-meetings-desk admin-module-panel" aria-label="Meeting list">
          <MeetingsFiltersBar filters={filters} onChange={setFilters} />
          <MeetingsTableSection
            items={items}
            loading={listLoading}
            page={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            pageSize={pagination.page_size}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            hasSearch={hasSearch}
          />
        </section>



        <EncadrantSupervisionOverview rows={encadrantOverview} loading={dashLoading} />

      </div>

    </AdminModulePageShell>

  );

};



export default EncadrantMeetingsPage;

