import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Play, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { workspaceMeetings } from '../data/workspacePlatformMock';
import { WORKSPACE_GLASS_CARD, WORKSPACE_PRIMARY_BTN } from '../constants/workspaceLayout';

const WorkspaceMeetingsHub: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${WORKSPACE_GLASS_CARD} student-workspace-glass student-workspace-meetings`}>
      <div className="student-workspace-section-head flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
          {t('student.encadrant.workspace.platform.meetings.title')}
        </h2>
        <button type="button" className={`${WORKSPACE_PRIMARY_BTN} shrink-0`}>
          <Calendar className="h-4 w-4" aria-hidden />
          {t('student.encadrant.workspace.platform.meetings.create')}
        </button>
      </div>
      <div className="student-workspace-meetings__grid">
        {workspaceMeetings.map((m) => {
          const isUpcoming = m.status === 'upcoming';
          return (
            <article
              key={m.id}
              className={`student-workspace-meeting-card ${isUpcoming ? 'student-workspace-meeting-card--upcoming' : 'student-workspace-meeting-card--past'}`}
            >
              <div className="student-workspace-meeting-card__body">
                <span className="student-workspace-meeting-card__badge">
                  {t(`student.encadrant.workspace.platform.meetings.status.${m.status}`)}
                </span>
                <h3 className="student-workspace-meeting-card__title">{t(m.titleKey)}</h3>
                <p className="student-workspace-meeting-card__datetime">
                  <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  <span>
                    {m.date}
                    <span className="student-workspace-meeting-card__sep" aria-hidden>
                      ·
                    </span>
                    {m.time}
                  </span>
                </p>
              </div>
              <div className="student-workspace-meeting-card__actions">
                {isUpcoming ? (
                  <button type="button" className="student-workspace-meeting-card__btn student-workspace-meeting-card__btn--primary">
                    <Video className="h-3.5 w-3.5" aria-hidden />
                    {t('student.encadrant.workspace.platform.meetings.join')}
                  </button>
                ) : null}
                {m.hasNotes ? (
                  <button type="button" className="student-workspace-meeting-card__btn student-workspace-meeting-card__btn--ghost">
                    <FileText className="h-3.5 w-3.5" aria-hidden />
                    {t('student.encadrant.workspace.platform.meetings.notes')}
                  </button>
                ) : null}
                {m.hasRecording ? (
                  <button type="button" className="student-workspace-meeting-card__btn student-workspace-meeting-card__btn--ghost">
                    <Play className="h-3.5 w-3.5" aria-hidden />
                    {t('student.encadrant.workspace.platform.meetings.recording')}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </motion.section>
  );
};

export default WorkspaceMeetingsHub;
