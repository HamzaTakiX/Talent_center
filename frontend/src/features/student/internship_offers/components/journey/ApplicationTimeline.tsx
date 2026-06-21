import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Circle } from 'lucide-react';
import type { ApplicationTimelineEvent } from '../../types/journeyTypes';
import { applicationStatusLabelKey } from '../../utils/applicationStatus';

interface ApplicationTimelineProps {
  events: ApplicationTimelineEvent[];
  pipelineSteps: string[];
  currentStatus: string;
}

const ApplicationTimeline: FunctionComponent<ApplicationTimelineProps> = ({
  events,
  pipelineSteps,
  currentStatus,
}) => {
  const { t } = useTranslation();
  const terminal = new Set(['REJECTED', 'WITHDRAWN', 'EXPIRED', 'OFFER_DECLINED']);
  const isTerminal = terminal.has(currentStatus);
  const currentIndex = pipelineSteps.indexOf(currentStatus);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {!isTerminal && (
        <ol className="m-0 flex list-none flex-col gap-0 p-0 sm:flex-row sm:items-start sm:justify-between">
          {pipelineSteps.map((step, index) => {
            const done = currentIndex >= index && currentIndex !== -1;
            const active = step === currentStatus;
            return (
              <li
                key={step}
                className="relative flex flex-1 flex-col items-center gap-1.5 pb-4 sm:pb-0"
              >
                {index < pipelineSteps.length - 1 && (
                  <span
                    className={`absolute left-1/2 top-3 hidden h-0.5 w-full sm:block ${
                      done ? 'bg-[var(--admin-brand)]' : 'bg-[var(--admin-border)]'
                    }`}
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-[1] flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    active
                      ? 'bg-[var(--admin-brand)] text-white ring-4 ring-[color-mix(in_srgb,var(--admin-brand)_25%,transparent)]'
                      : done
                        ? 'bg-[var(--admin-brand)] text-white'
                        : 'border-2 border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text-muted)]'
                  }`}
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
                </span>
                <span
                  className={`max-w-[4.5rem] text-center text-[9px] font-semibold uppercase leading-tight tracking-wide sm:max-w-[5.5rem] sm:text-[10px] ${
                    active ? 'text-[var(--admin-brand)]' : 'text-[var(--admin-text-muted)]'
                  }`}
                >
                  {t(applicationStatusLabelKey(step))}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {isTerminal && (
        <p className="m-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg-subtle)] px-4 py-3 text-sm font-medium text-[var(--admin-text-secondary)]">
          {t(applicationStatusLabelKey(currentStatus))}
        </p>
      )}

      {events.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 border-t border-[var(--admin-border)] pt-4 p-0">
          {events.map((event, i) => (
            <li key={`${event.status}-${i}`} className="flex gap-3 text-sm">
              <Circle className="mt-1 h-2 w-2 shrink-0 fill-[var(--admin-brand)] text-[var(--admin-brand)]" />
              <span className="min-w-0 flex-1">
                <span className="font-medium text-[var(--admin-text)]">
                  {t(applicationStatusLabelKey(event.status))}
                </span>
                {event.at && (
                  <span className="ml-2 text-xs text-[var(--admin-text-muted)]">
                    {new Date(event.at).toLocaleString()}
                  </span>
                )}
                {event.reason && (
                  <span className="mt-0.5 block text-xs text-[var(--admin-text-secondary)]">
                    {event.reason}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApplicationTimeline;
