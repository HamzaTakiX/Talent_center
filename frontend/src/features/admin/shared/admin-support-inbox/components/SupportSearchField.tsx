import { FunctionComponent } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

const SupportSearchField: FunctionComponent<Props> = ({
  value,
  onChange,
  placeholder = 'Rechercher une conversation…',
  ariaLabel = 'Rechercher une conversation',
}) => (
  <div className="isi-search-wrap">
    <label className="admin-header-search-field isi-search-field">
      <Search className="admin-header-search-icon" strokeWidth={2} aria-hidden />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="admin-input admin-header-search-input isi-search-input"
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="admin-header-search-clear"
          aria-label="Effacer"
        >
          <X className="size-3.5" strokeWidth={2.25} />
        </button>
      ) : null}
    </label>
  </div>
);

export default SupportSearchField;
