import { FunctionComponent } from 'react';
import type { SupportQuickFilters } from '../types/supportInboxTypes';

interface Props {
  filters: SupportQuickFilters;
  onToggle: (key: keyof SupportQuickFilters) => void;
  onClear: () => void;
  labels?: Partial<Record<keyof SupportQuickFilters, string>>;
}

const DEFAULT_LABELS: Record<keyof SupportQuickFilters, string> = {
  unread: 'Non lus',
  urgent: 'Urgent',
  archived: 'Archivées',
};

const SupportQuickFilterBar: FunctionComponent<Props> = ({
  filters,
  onToggle,
  onClear,
  labels = {},
}) => {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  const hasActive = filters.unread || filters.urgent || filters.archived;

  return (
    <div className="isi-filters-panel">
      <div className="isi-filters-quick">
        {(Object.keys(resolvedLabels) as (keyof SupportQuickFilters)[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            className={`isi-quick-filter ${filters[key] ? 'isi-quick-filter--active' : ''}`}
          >
            {resolvedLabels[key]}
          </button>
        ))}
      </div>
      {hasActive ? (
        <button type="button" onClick={onClear} className="isi-filters-clear">
          Effacer les filtres
        </button>
      ) : null}
    </div>
  );
};

export default SupportQuickFilterBar;
