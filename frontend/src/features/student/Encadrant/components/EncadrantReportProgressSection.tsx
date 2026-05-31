import { FunctionComponent } from 'react';

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LineChart } from 'lucide-react';

import {

  encadrantGlobalReportProgress,

  encadrantReportChapters,

} from '../data/encadrantMock';

import { ENCADRANT_OUTLINE_BTN, ENCADRANT_PRIMARY_BTN } from '../constants/encadrantStyles';

import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';

import {
  studentReportEditorPath,
  STUDENT_REPORTS_PATH,
} from '../../reports/constants/routes';

import {

  STUDENT_PROGRESS_FILL,

  STUDENT_PROGRESS_TRACK,

} from '../../design-system/studentSemanticStyles';



const ProgressBar: FunctionComponent<{ label: string; progress: number; thin?: boolean }> = ({

  label,

  progress,

  thin = false,

}) => {

  const { t } = useTranslation();



  return (

    <div className="min-w-0">

      <div className="mb-1.5 flex items-center justify-between gap-2">

        <span className="min-w-0 truncate font-inter text-[13px] font-medium leading-5 text-[var(--admin-text)] sm:text-sm">

          {label}

        </span>

        <span className="shrink-0 font-inter text-[13px] font-semibold tabular-nums leading-5 text-[var(--admin-brand)] sm:text-sm">

          {progress}%

        </span>

      </div>

      <div

        className={`${STUDENT_PROGRESS_TRACK} ${thin ? 'h-2' : 'h-3'}`}

        role="progressbar"

        aria-valuenow={progress}

        aria-valuemin={0}

        aria-valuemax={100}

        aria-label={t('student.encadrant.report.progressAria', { label, progress })}

      >

        <div

          className={`${STUDENT_PROGRESS_FILL} ${thin ? 'h-2' : 'h-3'}`}

          style={{ width: `${progress}%` }}

        />

      </div>

    </div>

  );

};



const EncadrantReportProgressSection: FunctionComponent = () => {

  const { t } = useTranslation();



  return (

    <section aria-label={t('student.encadrant.report.title')} className={`${ENCADRANT_SURFACE_CARD} min-w-0`}>

      <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">

        <div className="flex items-center gap-2">

          <LineChart className="h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />

          <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">

            {t('student.encadrant.report.title')}

          </h2>

        </div>

        <p className="m-0 mt-1 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">

          {t('student.encadrant.report.subtitle')}

        </p>

      </div>



      <div className="space-y-5 p-4 sm:space-y-6 sm:p-5">

        <div>

          <div className="mb-2 flex items-center justify-between gap-2">

            <span className="font-inter text-sm font-medium leading-5 text-[var(--admin-text)]">

              {t('student.encadrant.report.global')}

            </span>

            <span className="font-inter text-sm font-bold tabular-nums leading-5 text-[var(--admin-brand)]">

              {encadrantGlobalReportProgress}%

            </span>

          </div>

          <div

            className={`${STUDENT_PROGRESS_TRACK} h-3`}

            role="progressbar"

            aria-valuenow={encadrantGlobalReportProgress}

            aria-valuemin={0}

            aria-valuemax={100}

            aria-label={t('student.encadrant.report.progressAria', {

              label: t('student.encadrant.report.global'),

              progress: encadrantGlobalReportProgress,

            })}

          >

            <div

              className={`${STUDENT_PROGRESS_FILL} h-3`}

              style={{ width: `${encadrantGlobalReportProgress}%` }}

            />

          </div>

        </div>



        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">

          {encadrantReportChapters.map((chapter) => (

            <ProgressBar key={chapter.id} label={chapter.label} progress={chapter.progress} thin />

          ))}

        </div>



        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-2.5">

          <Link to={STUDENT_REPORTS_PATH} className={`${ENCADRANT_OUTLINE_BTN} w-full sm:w-auto text-center no-underline`}>

            {t('student.encadrant.report.viewReport')}

          </Link>

          <Link to={studentReportEditorPath('rpt-main-2026')} className={`${ENCADRANT_PRIMARY_BTN} w-full sm:w-auto text-center no-underline`}>

            {t('student.encadrant.report.continueWriting')}

          </Link>

        </div>

      </div>

    </section>

  );

};



export default EncadrantReportProgressSection;

