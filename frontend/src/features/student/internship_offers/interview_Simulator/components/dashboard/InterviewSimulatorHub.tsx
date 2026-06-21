import { FunctionComponent } from 'react';

import { useTranslation } from 'react-i18next';

import { motion } from 'framer-motion';

import {

  ArrowRight,

  BarChart3,

  Briefcase,

  Code,

  Heart,

  History,

  MessageSquare,

  Play,

  RotateCcw,

  Users,

} from 'lucide-react';

import {

  INTERVIEW_HISTORY,

  INTERVIEW_MODES,

  INTERVIEW_STUDENT_PROFILE,

} from '../../data/interviewSimulatorDashboardMock';

import type { InterviewModeId } from '../../types/interviewSimulatorDashboard';

import InterviewAnalyticsPanel from './InterviewAnalyticsPanel';

import InterviewCoachSidebar from './InterviewCoachSidebar';

import { AnimatedCounter, fadeUp } from './InterviewPrimitives';



const MODE_ICONS: Record<string, typeof Users> = {

  users: Users,

  briefcase: Briefcase,

  heart: Heart,

  code: Code,

  message: MessageSquare,

  sparkles: Users,

};



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

      <div className="sr-is__layout">

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



          {/* Interview Modes */}

          <motion.section {...fadeUp}>

            <h2 className="sr-is-section-title">

              {t('student.internshipOffers.interviewSim.modes.title')}

            </h2>

            <div className="sr-is-modes-grid">

              {INTERVIEW_MODES.map((mode) => {

                const Icon = MODE_ICONS[mode.icon] ?? Users;

                return (

                  <motion.button

                    key={mode.id}

                    type="button"

                    className="sr-is-mode-card"

                    onClick={() => onStartMode(mode.id)}

                    whileTap={{ scale: 0.995 }}

                  >

                    <div className="sr-is-mode-card__top">

                      <div className="sr-is-mode-card__icon">

                        <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden strokeWidth={2} />

                      </div>

                      <span className="sr-is-mode-card__arrow" aria-hidden>

                        <ArrowRight className="h-3.5 w-3.5" />

                      </span>

                    </div>

                    <h3 className="sr-is-mode-card__title">{t(mode.titleKey)}</h3>

                    <p className="sr-is-mode-card__desc">{t(mode.descKey)}</p>

                    {mode.examples && (

                      <div className="sr-is-mode-card__tags">

                        {mode.examples.slice(0, 4).map((ex) => (

                          <span key={ex} className="sr-is-tag">{ex}</span>

                        ))}

                      </div>

                    )}

                  </motion.button>

                );

              })}

            </div>

          </motion.section>



          {/* History */}

          <motion.section className="sr-is-panel sr-is-panel--flush" {...fadeUp}>

            <h2 className="sr-is-section-title sr-is-section-title--padded">

              <History className="h-4 w-4" aria-hidden />

              {t('student.internshipOffers.interviewSim.history.title')}

            </h2>

            <div className="sr-is-table-wrap">

              <table className="sr-is-table">

                <thead>

                  <tr>

                    <th>{t('student.internshipOffers.interviewSim.history.date')}</th>

                    <th>{t('student.internshipOffers.interviewSim.history.type')}</th>

                    <th>{t('student.internshipOffers.interviewSim.history.difficulty')}</th>

                    <th>{t('student.internshipOffers.interviewSim.history.score')}</th>

                    <th>{t('student.internshipOffers.interviewSim.history.duration')}</th>

                    <th>{t('student.internshipOffers.interviewSim.history.statusCol')}</th>

                  </tr>

                </thead>

                <tbody>

                  {INTERVIEW_HISTORY.map((row) => (

                    <tr key={row.id}>

                      <td>{row.date}</td>

                      <td>{t(row.typeKey)}</td>

                      <td className="capitalize">{row.difficulty}</td>

                      <td>

                        <span className="sr-is-table__score">{row.score}</span>

                      </td>

                      <td>{row.duration}</td>

                      <td>

                        <span className="admin-badge admin-badge--success text-xs">{t(row.statusKey)}</span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </motion.section>



          <div className="sr-is__coach--mobile">

            <InterviewCoachSidebar />

          </div>

        </div>



        <InterviewCoachSidebar className="sr-is__coach--desktop" />

      </div>

    </div>

  );

};



export default InterviewSimulatorHub;

