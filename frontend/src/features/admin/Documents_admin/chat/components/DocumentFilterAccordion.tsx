import { FunctionComponent, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import StudentAcademicFilterAccordion from '../../../shared/chat-filters/StudentAcademicFilterAccordion';
import type { StudentAcademicFilterCounts } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';
import {
  DOCUMENT_CATEGORIES,
  PRIORITIES,
  REQUEST_STATUSES,
} from '../data/documentSupportMock';
import type { DocumentInboxFilters } from '../types/documentChatTypes';

type Props = {
  filters: DocumentInboxFilters;
  hasActiveFilters: boolean;
  filterCounts: StudentAcademicFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  onToggle: <K extends 'categories' | 'statuses' | 'priorities'>(
    key: K,
    value: DocumentInboxFilters[K][number]
  ) => void;
  onToggleStudentAcademic: (key: keyof import('../../../shared/chat-filters/studentAcademicChatFilterTypes').StudentAcademicChatFilters, value: string) => void;
  onToggleQuick: (key: 'unread' | 'urgent' | 'archived') => void;
  onClear: () => void;
};

function AccordionGroup<T extends string>({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: readonly T[];
  selected: T[];
  onToggle: (item: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = selected.length;

  return (
    <div className="isi-accordion">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="isi-accordion-trigger"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="isi-accordion-meta">
          {activeCount > 0 ? (
            <span className="isi-accordion-count">{activeCount}</span>
          ) : null}
          <ChevronDown className={`isi-accordion-chevron ${open ? 'isi-accordion-chevron--open' : ''}`} />
        </span>
      </button>
      {open ? (
        <div className="isi-accordion-body">
          {items.map((item) => {
            const active = selected.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggle(item)}
                className={`isi-accordion-item ${active ? 'isi-accordion-item--active' : ''}`}
              >
                {item}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const DocumentFilterAccordion: FunctionComponent<Props> = ({
  filters,
  hasActiveFilters,
  filterCounts,
  programOptions,
  classOptions,
  academicLevelOptions,
  onToggle,
  onToggleStudentAcademic,
  onToggleQuick,
  onClear,
}) => (
  <div className="isi-filters-panel">
    <div className="isi-filters-quick">
      <button
        type="button"
        onClick={() => onToggleQuick('unread')}
        className={`isi-quick-filter ${filters.unread ? 'isi-quick-filter--active' : ''}`}
      >
        Non lus
      </button>
      <button
        type="button"
        onClick={() => onToggleQuick('urgent')}
        className={`isi-quick-filter ${filters.urgent ? 'isi-quick-filter--active' : ''}`}
      >
        Urgent
      </button>
      <button
        type="button"
        onClick={() => onToggleQuick('archived')}
        className={`isi-quick-filter ${filters.archived ? 'isi-quick-filter--active' : ''}`}
      >
        Archivées
      </button>
    </div>

    <StudentAcademicFilterAccordion
      filters={filters}
      filterCounts={filterCounts}
      programOptions={programOptions}
      classOptions={classOptions}
      academicLevelOptions={academicLevelOptions}
      onToggle={onToggleStudentAcademic}
    />

    <AccordionGroup
      title="Type de document"
      items={DOCUMENT_CATEGORIES}
      selected={filters.categories}
      onToggle={(v) => onToggle('categories', v)}
    />
    <AccordionGroup
      title="Statut demande"
      items={REQUEST_STATUSES}
      selected={filters.statuses}
      onToggle={(v) => onToggle('statuses', v)}
    />
    <AccordionGroup
      title="Priorité"
      items={PRIORITIES}
      selected={filters.priorities}
      onToggle={(v) => onToggle('priorities', v)}
    />

    {hasActiveFilters ? (
      <button type="button" onClick={onClear} className="isi-filters-clear">
        Effacer les filtres
      </button>
    ) : null}
  </div>
);

export default DocumentFilterAccordion;
