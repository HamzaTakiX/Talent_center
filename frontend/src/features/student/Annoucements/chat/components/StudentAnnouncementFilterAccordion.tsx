import { FunctionComponent, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  STUDENT_ANNOUNCEMENT_PRIORITIES,
  type StudentAnnouncementInboxFilters,
  type StudentAnnouncementPriority,
} from '../types/studentAnnouncementChatTypes';

type Props = {
  filters: StudentAnnouncementInboxFilters;
  hasActiveFilters: boolean;
  announcementTypeOptions: string[];
  onToggleType: (value: string) => void;
  onTogglePriority: (value: StudentAnnouncementPriority) => void;
  onToggleQuick: (key: 'unread' | 'urgent') => void;
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
        onClick={() => setOpen((value) => !value)}
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

const StudentAnnouncementFilterAccordion: FunctionComponent<Props> = ({
  filters,
  hasActiveFilters,
  announcementTypeOptions,
  onToggleType,
  onTogglePriority,
  onToggleQuick,
  onClear,
}) => {
  const { t } = useTranslation();
  const prefix = 'student.announcements.chat.inbox';

  return (
    <div className="isi-filters-panel">
      <div className="isi-filters-quick">
        <button
          type="button"
          onClick={() => onToggleQuick('unread')}
          className={`isi-quick-filter ${filters.unread ? 'isi-quick-filter--active' : ''}`}
        >
          {t(`${prefix}.unread`, { defaultValue: 'Non lus' })}
        </button>
        <button
          type="button"
          onClick={() => onToggleQuick('urgent')}
          className={`isi-quick-filter ${filters.urgent ? 'isi-quick-filter--active' : ''}`}
        >
          {t(`${prefix}.urgent`, { defaultValue: 'Urgent' })}
        </button>
      </div>

      {announcementTypeOptions.length > 0 ? (
        <AccordionGroup
          title={t(`${prefix}.announcementTypes`, { defaultValue: "Types d'annonce" })}
          items={announcementTypeOptions}
          selected={filters.announcementTypes}
          onToggle={onToggleType}
        />
      ) : null}

      <AccordionGroup
        title={t(`${prefix}.priorities`, { defaultValue: 'Priorité' })}
        items={STUDENT_ANNOUNCEMENT_PRIORITIES}
        selected={filters.priorities}
        onToggle={onTogglePriority}
      />

      {hasActiveFilters ? (
        <button type="button" onClick={onClear} className="isi-filters-clear">
          {t(`${prefix}.clearFilters`, { defaultValue: 'Effacer les filtres' })}
        </button>
      ) : null}
    </div>
  );
};

export default StudentAnnouncementFilterAccordion;
