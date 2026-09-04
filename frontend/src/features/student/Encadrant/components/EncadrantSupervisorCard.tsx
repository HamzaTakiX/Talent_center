import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, GraduationCap, Mail, MessageSquare, UserCheck, Video } from 'lucide-react';
import { encadrantSupervisor } from '../data/encadrantMock';
import { STUDENT_ENCADRANT_CHAT_PATH } from '../constants/routes';
import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';
import { WORKSPACE_OUTLINE_BTN, WORKSPACE_PRIMARY_BTN } from '../workspace/constants/workspaceLayout';
import { MeetingActionButton } from '../../../shared/meeting-room';

const EncadrantSupervisorCard: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section aria-label={t('student.encadrant.supervisorTitle')} className={`${ENCADRANT_SURFACE_CARD} min-w-0`}>
      <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--admin-brand-muted)] text-[var(--admin-brand)]">
            <UserCheck className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">
              {t('student.encadrant.supervisorTitle')}
            </h2>
            <p className="m-0 mt-0.5 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
              {t('student.encadrant.supervisor.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="rounded-[14px] border border-[color-mix(in_srgb,var(--admin-brand)_24%,var(--admin-border))] bg-[color-mix(in_srgb,var(--admin-brand)_8%,var(--admin-bg-elevated))] p-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <span className="relative mx-auto inline-flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--admin-brand)] font-inter text-xl font-bold leading-none text-white shadow-[0_4px_16px_color-mix(in_srgb,var(--admin-brand)_42%,transparent)] ring-4 ring-[color-mix(in_srgb,var(--admin-brand)_18%,transparent)] sm:mx-0 sm:h-20 sm:w-20 sm:text-2xl">
                <img
                  src={encadrantSupervisor.avatarUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
                <span aria-hidden>{encadrantSupervisor.initials}</span>
              </span>

              <div className="min-w-0 flex-1 space-y-3 text-center sm:text-start">
                <h3 className="m-0 text-base font-bold leading-6 text-[var(--admin-text)] sm:text-lg">
                  {encadrantSupervisor.name}
                </h3>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--admin-text-secondary)] sm:text-[13px]">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-[var(--admin-brand)]" aria-hidden />
                    <span className="text-[var(--admin-text-muted)]">
                      {t('student.encadrant.supervisor.department')}:
                    </span>
                    {encadrantSupervisor.department}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--admin-text-secondary)] sm:text-[13px]">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0 text-[var(--admin-brand)]" aria-hidden />
                    <span className="text-[var(--admin-text-muted)]">
                      {t('student.encadrant.supervisor.specialty')}:
                    </span>
                    {encadrantSupervisor.specialty}
                  </span>
                </div>

                <a
                  href={`mailto:${encadrantSupervisor.email}`}
                  aria-label={t('student.encadrant.supervisor.emailAria', {
                    email: encadrantSupervisor.email,
                  })}
                  className="inline-flex max-w-full items-center justify-center gap-1.5 break-all text-[13px] font-medium leading-5 text-[var(--admin-brand)] no-underline transition-colors hover:underline sm:justify-start sm:text-sm"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                  {encadrantSupervisor.email}
                </a>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 lg:justify-end">
              <button
                type="button"
                className={WORKSPACE_OUTLINE_BTN}
                onClick={() => navigate(STUDENT_ENCADRANT_CHAT_PATH)}
              >
                <MessageSquare className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {t('student.encadrant.chatLabel')}
              </button>

              <MeetingActionButton
                portal="student"
                mode="video"
                title={t('meetingRoom.withParticipant', { name: encadrantSupervisor.name })}
                className={WORKSPACE_PRIMARY_BTN}
              >
                <Video className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {t('student.encadrant.requestMeet')}
              </MeetingActionButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EncadrantSupervisorCard;
