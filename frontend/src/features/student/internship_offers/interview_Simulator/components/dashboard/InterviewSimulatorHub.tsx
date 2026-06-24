import { FunctionComponent } from 'react';

import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';

import {

  BarChart3,

  Play,

  RotateCcw,

  Users,

} from 'lucide-react';

import {

  INTERVIEW_STUDENT_PROFILE,

} from '../../data/interviewSimulatorDashboardMock';

import type { InterviewModeId } from '../../types/interviewSimulatorDashboard';

import InterviewAnalyticsPanel from './InterviewAnalyticsPanel';

import InterviewHistoryPanel from './InterviewHistoryPanel';

import { AnimatedCounter, fadeUp } from './InterviewPrimitives';



interface InterviewSimulatorHubProps {

  hasHistory: boolean;

  onStartMode: (modeId: InterviewModeId) => void;

  onContinue: () => void;

  onStartFirst: () => void;

}



const InterviewSimulatorHub: FunctionComponent<InterviewSimulatorHubProps> = ({

  hasHistory,

  onStartMode,

  onContinue,

  onStartFirst,

}) => {

  const { t } = useTranslation();

  const profile = INTERVIEW_STUDENT_PROFILE;



  if (!hasHistory) {

    return (

      <div className="sr-is__root sr-is">

        <div className="sr-is-panel sr-is-empty">

          <div className="sr-is-empty__icon">

            <Users className="h-10 w-10" aria-hidden />

          </div>

          <h2 className="sr-is-hero__title">{t('student.internshipOffers.interviewSim.empty.title')}</h2>

          <p className="sr-is-hero__subtitle">{t('student.internshipOffers.interviewSim.empty.desc')}</p>

          <button type="button" className="sr-is-btn sr-is-btn--primary" onClick={onStartFirst}>

            <Play className="h-4 w-4" aria-hidden />

            {t('student.internshipOffers.interviewSim.empty.cta')}

          </button>

        </div>

      </div>

    );

  }



  return (

    <div className="sr-is__root sr-is">

      <div className="flex flex-col gap-5">

          {/* Hero */}

          <motion.section className="sr-is-panel sr-is-hero" {...fadeUp}>

            <div className="sr-is-hero__inner">

              <div>

                <div className="flex items-center gap-4">

                  <div className="sr-is-hero__avatar" aria-hidden>{profile.avatarInitials}</div>

                  <div>

                    <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{profile.name}</p>

                    <p className="m-0 text-xs text-[var(--admin-text-secondary)]">{profile.program}</p>

                    <span className="sr-is-readiness">

                      {t('student.internshipOffers.interviewSim.hero.readiness')}:{' '}

                      <AnimatedCounter value={profile.readinessScore} suffix="%" />

                    </span>

                  </div>

                </div>

                <h1 className="sr-is-hero__title mt-4">{t('student.internshipOffers.interviewSim.hero.title')}</h1>

                <p className="sr-is-hero__subtitle">{t('student.internshipOffers.interviewSim.hero.subtitle')}</p>

              </div>

              <div className="flex flex-wrap gap-2">

                <button type="button" className="sr-is-btn sr-is-btn--primary" onClick={() => onStartMode('general')}>

                  <Play className="h-4 w-4" aria-hidden />

                  {t('student.internshipOffers.interviewSim.hero.start')}

                </button>

                <button type="button" className="sr-is-btn sr-is-btn--secondary" onClick={onContinue}>

                  <RotateCcw className="h-4 w-4" aria-hidden />

                  {t('student.internshipOffers.interviewSim.hero.continue')}

                </button>

                <button type="button" className="sr-is-btn sr-is-btn--secondary">

                  <BarChart3 className="h-4 w-4" aria-hidden />

                  {t('student.internshipOffers.interviewSim.hero.reports')}

                </button>

              </div>

            </div>

          </motion.section>



          {/* Analytics — moved up */}

          <InterviewAnalyticsPanel />



          <InterviewHistoryPanel />

      </div>

    </div>

  );

};



export default InterviewSimulatorHub;

