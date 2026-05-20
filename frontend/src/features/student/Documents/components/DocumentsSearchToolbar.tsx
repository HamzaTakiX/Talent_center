import { FunctionComponent } from 'react';
import { Filter, Search } from 'lucide-react';
import {
  DOCUMENTS_FILTER_BTN,
  DOCUMENTS_SEARCH_INPUT,
  DOCUMENTS_SEARCH_TOOLBAR,
} from '../constants/documentsStyles';

interface DocumentsSearchToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const DocumentsSearchToolbar: FunctionComponent<DocumentsSearchToolbarProps> = ({
  search,
  onSearchChange,
}) => (
  <div className={DOCUMENTS_SEARCH_TOOLBAR} role="search">
    <div className="relative w-full min-w-0 sm:max-w-md sm:flex-1">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-text-muted)] max-[429px]:left-2.5 max-[429px]:size-3.5"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher un document..."
        className={DOCUMENTS_SEARCH_INPUT}
        aria-label="Rechercher un document"
      />
    </div>
    <button
      type="button"
      className={DOCUMENTS_FILTER_BTN}
      aria-label="Filtrer les documents"
      onClick={() => console.log('Open documents filters')}
    >
      <Filter className="size-4" strokeWidth={1.75} aria-hidden />
    </button>
  </div>
);

export default DocumentsSearchToolbar;
