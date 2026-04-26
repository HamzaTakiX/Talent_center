import { FunctionComponent } from 'react';
import { Sparkles } from 'lucide-react';

interface SectionBadgeProps {
  message: string;
}

/**
 * Floating AI-feedback badge displayed near a CV section.
 * Style matches the design spec (blueviolet, rounded, soft shadow).
 */
const SectionBadge: FunctionComponent<SectionBadgeProps> = ({ message }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#8a2be2] text-white text-xs leading-4 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
      <Sparkles className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default SectionBadge;
