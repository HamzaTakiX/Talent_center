import { FunctionComponent, useCallback, useState } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import AgendaOfativeSidebar from '../components/AgendaOfativeSidebar';
import AgendaCalendarModule from '../components/AgendaCalendarModule';
import AgendaFloatingUpcoming from '../components/AgendaFloatingUpcoming';
import AgendaEventDetailModal from '../components/AgendaEventDetailModal';
import AgendaEventFormModal, { type AgendaEventDraft } from '../components/AgendaEventFormModal';
import AgendaAvailabilityModal from '../components/AgendaAvailabilityModal';
import AgendaSearchPanel from '../components/AgendaSearchPanel';
import { useAgendaPlatform } from '../hooks/useAgendaPlatform';
import { addMinutes } from '../utils/agendaRange';
import type { AgendaEventInput, AgendaPlatformEvent } from '../types';

const AgendaPage: FunctionComponent = () => {
  const platform = useAgendaPlatform();
  const [draft, setDraft] = useState<AgendaEventDraft | null>(null);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openCreate = useCallback((start?: Date) => {
    setDraft({
      start,
      end: start ? addMinutes(start, 60) : undefined,
    });
  }, []);

  const submitEvent = useCallback(
    async (input: AgendaEventInput, event?: AgendaPlatformEvent) => {
      if (event) return platform.updateEvent(event.id, input);
      return platform.createEvent(input);
    },
    [platform],
  );

  return (
    <StudentLayout mainFillHeight contentFlush>
      <div
        id="student-encadrant-agenda-root"
        className="ofative-agenda"
        aria-busy={platform.loading || undefined}
      >
        <AgendaOfativeSidebar
          loading={platform.loading}
          collapsed={platform.sidebarCollapsed}
          onToggleCollapsed={() => platform.setSidebarCollapsed((v) => !v)}
          rangeStart={platform.rangeStart}
          focusedDay={platform.focusedDay}
          onRangeChange={platform.setRangeStart}
          onSelectDay={platform.selectDay}
          formatDateKey={platform.formatDateKey}
          startOfWeek={platform.startOfWeek}
          allEventsByDay={platform.allEventsByDay}
          searchQuery={platform.searchQuery}
          onSearchChange={platform.setSearchQuery}
          enabledCategories={platform.enabledCategories}
          onToggleCategory={platform.toggleCategory}
        />

        <div className="ofative-agenda__workspace">
          <AgendaCalendarModule
            loading={platform.loading}
            error={platform.error}
            view={platform.view}
            onViewChange={platform.setView}
            rangeStart={platform.rangeStart}
            shiftRange={platform.shiftRange}
            goToday={platform.goToday}
            eventsByDay={platform.eventsByDay}
            onSelectEvent={platform.setSelectedEvent}
            formatDateKey={platform.formatDateKey}
            startOfWeek={platform.startOfWeek}
            onAddEvent={() => openCreate()}
            onOpenAvailability={() => setAvailabilityOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            onCreateAt={openCreate}
          />
        </div>

        <AgendaFloatingUpcoming
          event={platform.loading ? null : platform.floatingUpcoming}
          onSelect={platform.setSelectedEvent}
        />

        <AgendaEventDetailModal
          event={platform.selectedEvent}
          onClose={() => platform.setSelectedEvent(null)}
          onEdit={(event) => {
            platform.setSelectedEvent(null);
            setDraft({ event });
          }}
          onDelete={(event) =>
            platform.deleteEvent(event.id, {
              scope: event.isRecurring ? 'this' : undefined,
              occurrenceStart: event.isRecurring ? event.occurrenceStart : undefined,
            })
          }
          onRespond={platform.respond}
        />

        <AgendaEventFormModal
          draft={draft}
          contacts={platform.contacts}
          reminderPresets={platform.metadata?.reminderPresets}
          onClose={() => setDraft(null)}
          onSubmit={submitEvent}
        />

        <AgendaAvailabilityModal
          open={availabilityOpen}
          contacts={platform.contacts}
          onClose={() => setAvailabilityOpen(false)}
          onPickSlot={(slot) => {
            setAvailabilityOpen(false);
            setDraft({
              start: new Date(slot.start),
              end: new Date(slot.end),
            });
          }}
        />

        <AgendaSearchPanel
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelectEvent={platform.setSelectedEvent}
        />
      </div>
    </StudentLayout>
  );
};

export default AgendaPage;
