import { FunctionComponent } from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  GraduationCap,
  MessageCircleMore,
  Send,
  Shield,
  Users,
  XCircle,
} from 'lucide-react';
import type { StudentHistoryStatItem } from '../types';

interface HistoryStatCardProps {
  item: StudentHistoryStatItem;
  onClick?: () => void;
}

const iconClassName = 'h-6 w-6 relative text-white opacity-100';

const iconByType = {
  activity: <Clock3 className={iconClassName} strokeWidth={2.4} aria-hidden />,
  users: <Users className={iconClassName} strokeWidth={2.4} aria-hidden />,
  shield: <Shield className={iconClassName} strokeWidth={2.4} aria-hidden />,
  graduation: <GraduationCap className={iconClassName} strokeWidth={2.4} aria-hidden />,
  briefcase: <BriefcaseBusiness className={iconClassName} strokeWidth={2.4} aria-hidden />,
  file: <FileText className={iconClassName} strokeWidth={2.4} aria-hidden />,
  receipt: <DollarSign className={iconClassName} strokeWidth={2.4} aria-hidden />,
  message: <MessageCircleMore className={iconClassName} strokeWidth={2.4} aria-hidden />,
} as const;

const iconByCardKey: Record<string, JSX.Element> = {
  total_events: <Clock3 className={iconClassName} strokeWidth={2.4} aria-hidden />,
  applied_actions: <Send className={iconClassName} strokeWidth={2.4} aria-hidden />,
  accepted_actions: <CheckCircle2 className={iconClassName} strokeWidth={2.4} aria-hidden />,
  rejected_actions: <XCircle className={iconClassName} strokeWidth={2.4} aria-hidden />,
};

const iconBgByCardKey: Record<string, string> = {
  total_events: 'bg-[#3b82f6]',
  applied_actions: 'bg-[#a855f7]',
  accepted_actions: 'bg-[#22c55e]',
  rejected_actions: 'bg-[#ef4444]',
};

const HistoryStatCard: FunctionComponent<HistoryStatCardProps> = ({ item, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-[98px] w-full cursor-pointer flex-col items-start rounded-[14px] border border-solid border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-left text-sm text-[var(--admin-text-muted)] font-sans transition-shadow hover:shadow-md"
    >
      <div className="box-border flex w-full flex-1 min-w-0 items-center justify-between gap-5 p-6">
        <div className="min-w-0 flex flex-1 flex-col items-start gap-1">
          <div className="min-h-4 self-stretch flex items-start">
            <span className="relative leading-4 font-medium truncate">{item.label}</span>
          </div>
          <div className="relative min-h-7 self-stretch flex items-start text-[32px] font-bold leading-7 tracking-tight text-[var(--admin-text)] tabular-nums">
            <span className="relative shrink-0">{item.value}</span>
          </div>
        </div>
        <div className="h-10 w-10 shrink-0">
          <div
            className={`relative h-10 w-full rounded-[10px] box-border flex items-center justify-center px-2.5 py-0 [&_svg]:!text-white [&_svg]:!opacity-100 ${
              iconBgByCardKey[item.key] ?? 'bg-[#2b7fff]'
            }`}
          >
            {iconByCardKey[item.key] ?? iconByType[item.icon]}
          </div>
        </div>
      </div>
    </button>
  );
};

export default HistoryStatCard;
