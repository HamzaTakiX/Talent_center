import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BellRing, CalendarClock, ClipboardList, User } from 'lucide-react';
import { encadrantReminder, encadrantSupervisor } from '../data/encadrantMock';
import { STUDENT_ENCADRANT_AGENDA_PATH } from '../constants/routes';
import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';

const EncadrantReminderBanner: FunctionComponent = () => {
  const { t } = useTranslation();
  const reminderContext = {
    supervisor: encadrantSupervisor.name,
    time: encadrantReminder.meetingTime,
  };

  return (
    <section
      role="alert"
      aria-label={t('student.encadrant.reminder.badge')}
      className={`${ENCADRANT_SURFACE_CARD} min-w-0 overflow-hidden border-[color-mix(in_srgb,#f59e0b_32%,var(--admin-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,#f59e0b_10%,var(--admin-bg-elevated))_0%,var(--admin-bg-elevated)_55%)]`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-amber-500/25 bg-amber-500/15 text-amber-600 dark:text-amber-300">
            <BellRing className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                {t('student.encadrant.reminder.badge')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--admin-surface-muted)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--admin-text-secondary)]">
                <CalendarClock className="h-3 w-3 shrink-0" aria-hidden />
                {t('student.encadrant.reminder.when', reminderContext)}
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="m-0 text-sm font-bold leading-5 text-[var(--admin-text)] sm:text-base">
                {t('student.encadrant.reminder.title')}
              </h3>
              <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-[var(--admin-text-secondary)] sm:text-sm">
                {t('student.encadrant.reminder.message', reminderContext)}
              </p>
            </div>

            <p className="m-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--admin-text-muted)] sm:text-[13px]">
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {encadrantSupervisor.name}
            </p>
          </div>
        </div>

        <Link
          to={STUDENT_ENCADRANT_AGENDA_PATH}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[12px] border border-amber-500/35 bg-amber-500 px-4 py-2.5 text-center text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(245,158,11,0.28)] transition-[filter,transform] hover:brightness-105 active:scale-[0.99] sm:w-auto"
        >
          <ClipboardList className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('student.encadrant.reminder.prepare')}
        </Link>
      </div>
    </section>
  );
};

export default EncadrantReminderBanner;
