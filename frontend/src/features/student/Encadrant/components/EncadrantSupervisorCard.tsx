import { FunctionComponent } from 'react';

import { useTranslation } from 'react-i18next';

import { MessageSquare, User, Video } from 'lucide-react';

import { encadrantSupervisor } from '../data/encadrantMock';

import { ENCADRANT_OUTLINE_BTN, ENCADRANT_PRIMARY_BTN } from '../constants/encadrantStyles';



const EncadrantSupervisorCard: FunctionComponent = () => {

  const { t } = useTranslation();



  return (

    <section

      aria-label={t('student.encadrant.supervisorTitle')}

      className="box-border flex w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[14px] border-2 border-solid border-[color-mix(in_srgb,var(--admin-brand)_28%,var(--admin-border))] bg-[var(--admin-bg-elevated)] p-4 font-inter shadow-[var(--admin-shadow-sm)] sm:gap-5 sm:p-5 md:p-6"

    >

      <div className="flex items-center gap-2">

        <User className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />

        <h2 className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">

          {t('student.encadrant.supervisorTitle')}

        </h2>

      </div>



      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">

        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">

          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--admin-brand)] font-inter text-lg font-bold leading-none text-white sm:h-16 sm:w-16 sm:text-xl">

            {encadrantSupervisor.initials}

          </span>

          <div className="min-w-0 flex-1">

            <h3 className="m-0 text-base font-bold leading-6 text-[var(--admin-text)] sm:text-lg">{encadrantSupervisor.name}</h3>

            <p className="m-0 mt-0.5 text-sm leading-5 text-[var(--admin-text-muted)]">{encadrantSupervisor.department}</p>

            <p className="m-0 text-sm leading-5 text-[var(--admin-text-muted)]">{encadrantSupervisor.specialty}</p>

            <a

              href={`mailto:${encadrantSupervisor.email}`}

              className="mt-1 inline-block break-all text-sm font-medium leading-5 text-[var(--admin-brand)] hover:underline"

            >

              {encadrantSupervisor.email}

            </a>

          </div>

        </div>



        <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">

          <button type="button" className={`${ENCADRANT_PRIMARY_BTN} w-full sm:w-auto`}>

            <MessageSquare className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />

            {t('student.encadrant.chatLabel')}

          </button>

          <button type="button" className={`${ENCADRANT_OUTLINE_BTN} w-full sm:w-auto`}>

            <Video className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />

            {t('student.encadrant.meeting')}

          </button>

        </div>

      </div>

    </section>

  );

};



export default EncadrantSupervisorCard;

