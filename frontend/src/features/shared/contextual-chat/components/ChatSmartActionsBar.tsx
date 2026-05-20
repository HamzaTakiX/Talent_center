import { FunctionComponent } from 'react';
import {
  AlertCircle,
  CalendarPlus,
  CheckCircle2,
  ListTodo,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SmartActionCode } from '../types';

const ACTIONS: { code: SmartActionCode; icon: typeof ListTodo }[] = [
  { code: 'create_task', icon: ListTodo },
  { code: 'create_meeting', icon: CalendarPlus },
  { code: 'request_correction', icon: RotateCcw },
  { code: 'validate', icon: CheckCircle2 },
  { code: 'escalate', icon: ShieldAlert },
  { code: 'mark_urgent', icon: AlertCircle },
];

export const ChatSmartActionsBar: FunctionComponent<{
  onAction: (code: SmartActionCode) => void;
  disabled?: boolean;
}> = ({ onAction, disabled }) => {
  const { t } = useTranslation();
  return (
    <div className="ctx-chat-smart-actions flex flex-wrap gap-1.5 border-t border-[var(--admin-border)] px-4 py-2">
      {ACTIONS.map(({ code, icon: Icon }) => (
        <button
          key={code}
          type="button"
          disabled={disabled}
          onClick={() => onAction(code)}
          className="ctx-chat-smart-action-btn"
        >
          <Icon className="size-3.5 shrink-0" aria-hidden />
          <span>{t(`admin.contextualChat.actions.${code}`)}</span>
        </button>
      ))}
    </div>
  );
};
