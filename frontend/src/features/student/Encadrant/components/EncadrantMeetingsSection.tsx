import { FunctionComponent } from 'react';

import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

import { Calendar, Video } from 'lucide-react';

import { encadrantMeetings } from '../data/encadrantMock';

import { STUDENT_ENCADRANT_AGENDA_PATH } from '../constants/routes';

import { ENCADRANT_PRIMARY_BTN, ENCADRANT_SECTION_HEADER_BTN } from '../constants/encadrantStyles';

import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';

import { STUDENT_ICON_CHIP_INFO } from '../../design-system/studentSemanticStyles';



const EncadrantMeetingsSection: FunctionComponent = () => {

  const { t } = useTranslation();

  const navigate = useNavigate();



  return (

    <section aria-label={t('student.encadrant.meetings.title')} className={`${ENCADRANT_SURFACE_CARD} min-w-0`}>

      <div className="flex flex-col gap-3 border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-5">

        <div className="min-w-0">

          <div className="flex items-center gap-2">

            <Video className="h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />

            <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">

              {t('student.encadrant.meetings.title')}

            </h2>

          </div>

          <p className="m-0 mt-1 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">

            {t('student.encadrant.meetings.subtitle')}

          </p>

        </div>

        <button
          type="button"
          className={ENCADRANT_SECTION_HEADER_BTN}
          onClick={() => navigate(STUDENT_ENCADRANT_AGENDA_PATH)}
        >

          {t('student.encadrant.meetings.viewAll')}

        </button>

      </div>



      <div className="flex flex-col gap-3 p-4 sm:p-5">

        {encadrantMeetings.map((meeting) => (

          <article

            key={meeting.id}

            className="flex min-w-0 flex-col gap-3 rounded-[12px] border border-solid border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4"

          >

            <div className="flex min-w-0 flex-1 items-start gap-3">

              <span className={`inline-flex h-10 w-10 shrink-0 rounded-[10px] ${STUDENT_ICON_CHIP_INFO}`}>

                <Video className="h-5 w-5" strokeWidth={1.75} aria-hidden />

              </span>

              <div className="min-w-0">

                <h3 className="m-0 text-sm font-semibold leading-5 text-[var(--admin-text)] sm:text-base">

                  {meeting.title}

                </h3>

                <p className="m-0 mt-1 inline-flex items-center gap-1.5 text-[13px] leading-5 text-[var(--admin-text-muted)]">

                  <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />

                  {meeting.dateTime}

                </p>

              </div>

            </div>

            <button type="button" className={`${ENCADRANT_PRIMARY_BTN} w-full shrink-0 sm:w-auto`}>

              {t('student.encadrant.meetings.join')}

            </button>

          </article>

        ))}

      </div>

    </section>

  );

};



export default EncadrantMeetingsSection;

