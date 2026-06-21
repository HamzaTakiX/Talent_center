import { FunctionComponent, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import StudentAcademicFilterAccordion from '../../../shared/chat-filters/StudentAcademicFilterAccordion';
import type { StudentAcademicFilterCounts } from '../../../shared/chat-filters/studentAcademicChatFilterTypes';
import {
  APPLICATION_STATUS_LABELS,
  CONVERSATION_PRIORITY_LABELS,
  CONVERSATION_TAG_LABELS,
  PRIMARY_FILTERS,
  type FilterCounts,
  type InboxFilters,
  type PrimaryFilterCounts,
  type PrimaryInboxFilter,
} from '../types/internshipChatTypes';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';

type Props = {
  filters: InboxFilters;
  hasActiveFilters: boolean;
  filterCounts: FilterCounts;
  primaryFilterCounts: PrimaryFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  internshipTypeOptions: string[];
  onSetPrimary: (filter: PrimaryInboxFilter) => void;
  onToggle: <K extends 'applicationStatuses' | 'internshipTypes' | 'programs' | 'academicLevels' | 'classes' | 'priorities' | 'tags'>(
    key: K,
    value: InboxFilters[K][number],
  ) => void;
  onClear: () => void;
};

function AccordionGroup<T extends string>({
  title,
  items,
  selected,
  counts,
  onToggle,
}: {
  title: string;
  items: readonly T[];
  selected: T[];
  counts?: Record<string, number>;
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
          {activeCount > 0 ? <span className="isi-accordion-count">{activeCount}</span> : null}
          <ChevronDown className={`isi-accordion-chevron ${open ? 'isi-accordion-chevron--open' : ''}`} />
        </span>
      </button>
      {open ? (
        <div className="isi-accordion-body">
          {items.map((item) => {
            const active = selected.includes(item);
            const count = counts?.[item];
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggle(item)}
                className={`isi-accordion-item ${active ? 'isi-accordion-item--active' : ''}`}
              >
                <span>{item}</span>
                {count != null && count > 0 ? (
                  <span className="isi-accordion-item-count">{count}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const InternshipFilterAccordion: FunctionComponent<Props> = ({
  filters,
  hasActiveFilters,
  filterCounts,
  primaryFilterCounts,
  programOptions,
  classOptions,
  academicLevelOptions,
  internshipTypeOptions,
  onSetPrimary,
  onToggle,
  onClear,
}) => {
  const { t } = useInternshipInboxCopy();

  const academicCounts: StudentAcademicFilterCounts = {
    programs: filterCounts.programs,
    academicLevels: filterCounts.academicLevels,
    classes: filterCounts.classes,
  };

  return (
    <div className="isi-filters-panel">
      <div className="isi-filters-quick">
        {PRIMARY_FILTERS.map((key) => {
          const isActive = filters.primary === key;
          const count = primaryFilterCounts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSetPrimary(key)}
              className={`isi-quick-filter ${isActive ? 'isi-quick-filter--active' : ''}`}
            >
              {t(`primaryChips.${key}`)}
              {count > 0 ? ` (${count > 99 ? '99+' : count})` : ''}
            </button>
          );
        })}
      </div>

      <StudentAcademicFilterAccordion
        filters={filters}
        filterCounts={academicCounts}
        programOptions={programOptions}
        classOptions={classOptions}
        academicLevelOptions={academicLevelOptions}
        onToggle={(key, value) => onToggle(key, value)}
      />

      <AccordionGroup
        title={t('filterSections.internshipType')}
        items={internshipTypeOptions}
        selected={filters.internshipTypes}
        counts={filterCounts.internshipTypes}
        onToggle={(v) => onToggle('internshipTypes', v as InboxFilters['internshipTypes'][number])}
      />
      <AccordionGroup
        title={t('filterSections.applicationStatus')}
        items={APPLICATION_STATUS_LABELS}
        selected={filters.applicationStatuses}
        counts={filterCounts.applicationStatuses}
        onToggle={(v) => onToggle('applicationStatuses', v)}
      />
      <AccordionGroup
        title={t('filterSections.priority')}
        items={CONVERSATION_PRIORITY_LABELS}
        selected={filters.priorities}
        onToggle={(v) => onToggle('priorities', v)}
      />
      <AccordionGroup
        title={t('filterSections.tags')}
        items={CONVERSATION_TAG_LABELS}
        selected={filters.tags}
        onToggle={(v) => onToggle('tags', v)}
      />

      {hasActiveFilters ? (
        <button type="button" onClick={onClear} className="isi-filters-clear">
          {t('filterSections.clear')}
        </button>
      ) : null}
    </div>
  );
};

export default InternshipFilterAccordion;
