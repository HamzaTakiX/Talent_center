import { FunctionComponent } from 'react';
import { Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { INTERVIEW_STUDENT_PROFILE } from '../../../data/interviewSimulatorDashboardMock';
import { CONFIG_SKILL_KEYS } from '../../../data/interviewConfigMock';
import { CircularScore, ScoreBar } from '../InterviewPrimitives';

const InterviewConfigSidebar: FunctionComponent = () => {
  const { t } = useTranslation();
  const readiness = INTERVIEW_STUDENT_PROFILE.readinessScore;

  return (
    <aside className="sr-is-config-sidebar">
      <div className="sr-is-config-sidebar__card sr-is-config-sidebar__card--readiness">
        <h3 className="sr-is-config-sidebar__title">{t('student.internshipOffers.interviewSim.config.sidebar.readiness')}</h3>
        <div className="sr-is-config-sidebar__readiness">
          <CircularScore score={readiness} size={120} />
          <p className="sr-is-config-sidebar__readiness-caption">
            {t('student.internshipOffers.interviewSim.config.sidebar.readinessCaption')}
          </p>
        </div>
      </div>

      <div className="sr-is-config-sidebar__card">
        <h3 className="sr-is-config-sidebar__title">
          <Target className="h-4 w-4" aria-hidden />
          {t('student.internshipOffers.interviewSim.config.sidebar.skillsTitle')}
        </h3>
        <ul className="sr-is-config-sidebar__skills">
          {CONFIG_SKILL_KEYS.map((key, index) => (
            <li key={key}>
              <span>{t(key)}</span>
              <ScoreBar score={[82, 74, 78, 85, 70][index] ?? readiness} delay={index * 0.08} />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default InterviewConfigSidebar;
