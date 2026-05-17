import { FunctionComponent } from 'react';
import { ChevronRight } from 'lucide-react';
import type { AdminSearchItem } from '../types';
import MatchHighlight from './MatchHighlight';

interface AdminCommandPaletteResultProps {
  item: AdminSearchItem;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
}

const AdminCommandPaletteResult: FunctionComponent<AdminCommandPaletteResultProps> = ({
  item,
  isActive,
  onSelect,
  onHover,
}) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      className={`admin-cmd-result ${isActive ? 'admin-cmd-result--active' : ''}`}
      onClick={onSelect}
      onMouseEnter={onHover}
    >
      <span className="admin-cmd-result-icon" aria-hidden>
        {Icon ? <Icon className="h-4 w-4" strokeWidth={2} /> : null}
      </span>
      <span className="admin-cmd-result-body">
        <span className="admin-cmd-result-title">
          <MatchHighlight text={item.title} matchedIndices={item.matchedIndices} />
        </span>
        {item.subtitle && (
          <span className="admin-cmd-result-subtitle">{item.subtitle}</span>
        )}
      </span>
      <ChevronRight className="admin-cmd-result-arrow h-4 w-4 shrink-0 opacity-0" strokeWidth={2} aria-hidden />
    </button>
  );
};

export default AdminCommandPaletteResult;
