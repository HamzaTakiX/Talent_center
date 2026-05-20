import { FunctionComponent, ReactNode } from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import {
  CV_TOOL_CONTEXT_ROW_DEFAULT,
  CV_TOOL_CONTEXT_ROW_HIGHLIGHT,
  CV_TOOL_ICON_BOX_BLUE,
} from '../constants/cvAnalysisToolStyles';

interface ContextSelectableRowProps {
  label: string;
  icon: LucideIcon;
  highlighted?: boolean;
  onClick?: () => void;
  trailing?: ReactNode;
}

const ContextSelectableRow: FunctionComponent<ContextSelectableRowProps> = ({
  label,
  icon: Icon,
  highlighted = false,
  onClick,
  trailing,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={highlighted ? CV_TOOL_CONTEXT_ROW_HIGHLIGHT : CV_TOOL_CONTEXT_ROW_DEFAULT}
    >
      <span className={CV_TOOL_ICON_BOX_BLUE}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium leading-5 text-[var(--admin-text)] sm:text-sm">
        {label}
      </span>
      {trailing ?? (
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)] sm:h-5 sm:w-5"
          strokeWidth={1.75}
          aria-hidden
        />
      )}
    </button>
  );
};

export default ContextSelectableRow;
