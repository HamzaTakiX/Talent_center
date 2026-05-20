import { FunctionComponent } from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import type { MeetingAlert } from '../types/supervisionMeeting';

interface MeetingsAlertsBannerProps {
  alerts: MeetingAlert[];
}

const iconFor = (severity: string) => {
  if (severity === 'high') return AlertCircle;
  if (severity === 'warning') return AlertTriangle;
  return Info;
};

const MeetingsAlertsBanner: FunctionComponent<MeetingsAlertsBannerProps> = ({ alerts }) => {
  if (!alerts.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => {
        const Icon = iconFor(alert.severity);
        return (
          <div
            key={alert.code}
            className={`admin-meetings-alert admin-meetings-alert--${alert.severity}`}
            role="alert"
          >
            <Icon className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" />
            <span className="text-sm">{alert.message}</span>
            <span className="ms-auto rounded-full bg-[var(--admin-brand)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--admin-brand)]">
              {alert.count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MeetingsAlertsBanner;
