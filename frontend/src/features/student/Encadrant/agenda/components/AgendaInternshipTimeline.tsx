import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fadeInUp } from '../../../../admin/dashboard/ui/animations';
import { agendaTimelineSteps } from '../data/agendaPlatformMock';
import { AGENDA_GLASS_CARD } from '../constants/agendaLayout';

const AgendaInternshipTimeline: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.section {...fadeInUp} className={`${AGENDA_GLASS_CARD} student-agenda-glass student-agenda-journey`}>
      <div className="student-agenda-section-head !border-0 !pb-0">
        <div>
          <h2 className="m-0 text-lg font-bold text-[var(--admin-text)]">
            {t('student.encadrant.agenda.platform.journey.title')}
          </h2>
          <p className="m-0 mt-1 text-sm text-[var(--admin-text-muted)]">
            {t('student.encadrant.agenda.platform.journey.subtitle')}
          </p>
        </div>
      </div>
      <div className="student-agenda-journey__track">
        {agendaTimelineSteps.map((step, index) => (
          <div key={step.id} className="student-agenda-journey__step">
            <div className="student-agenda-journey__rail">
              <span className={`student-agenda-journey__marker student-agenda-journey__marker--${step.status}`}>
                {step.status === 'completed' ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
              </span>
              {index < agendaTimelineSteps.length - 1 ? (
                <span className="student-agenda-journey__line" aria-hidden />
              ) : null}
            </div>
            <div className="min-w-0 pb-1">
              <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{t(step.labelKey)}</p>
              {step.dateKey ? (
                <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">{t(step.dateKey)}</p>
              ) : null}
              <span className="mt-1 inline-block text-[11px] font-medium uppercase tracking-wide text-[var(--admin-text-muted)]">
                {t(`student.encadrant.agenda.platform.journey.status.${step.status}`)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default AgendaInternshipTimeline;
