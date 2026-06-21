import { FunctionComponent, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  StudentAcademicChatFilters,
  StudentAcademicFilterCounts,
} from './studentAcademicChatFilterTypes';

type Props = {
  filters: StudentAcademicChatFilters;
  filterCounts: StudentAcademicFilterCounts;
  programOptions: string[];
  classOptions: string[];
  academicLevelOptions: string[];
  onToggle: (key: keyof StudentAcademicChatFilters, value: string) => void;
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
          <ChevronDown
            className={`isi-accordion-chevron ${open ? 'isi-accordion-chevron--open' : ''}`}
          />
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

const StudentAcademicFilterAccordion: FunctionComponent<Props> = ({
  filters,
  filterCounts,
  programOptions,
  classOptions,
  academicLevelOptions,
  onToggle,
}) => {
  const { t } = useTranslation();
  const prefix = 'admin.modules.offers.inbox.filterSections';

  return (
    <>
      <AccordionGroup
        title={t(`${prefix}.program`)}
        items={programOptions}
        selected={filters.programs}
        counts={filterCounts.programs}
        onToggle={(v) => onToggle('programs', v)}
      />
      <AccordionGroup
        title={t(`${prefix}.academicLevel`)}
        items={academicLevelOptions}
        selected={filters.academicLevels}
        counts={filterCounts.academicLevels}
        onToggle={(v) => onToggle('academicLevels', v)}
      />
      <AccordionGroup
        title={t(`${prefix}.class`)}
        items={classOptions}
        selected={filters.classes}
        counts={filterCounts.classes}
        onToggle={(v) => onToggle('classes', v)}
      />
    </>
  );
};

export default StudentAcademicFilterAccordion;
