import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Video } from 'lucide-react';
import type { JourneyInterview } from '../../types/journeyTypes';
import { STUDENT_INTERVIEW_SIMULATOR_PATH } from '../../interview_Simulator/constants/routes';

interface InternshipInterviewsPanelProps {
  interviews: JourneyInterview[];
}

const InternshipInterviewsPanel: FunctionComponent<InternshipInterviewsPanelProps> = ({ interviews }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (interviews.length === 0) return null;

  return (
    <section
      aria-label={t('student.internshipOffers.journey.interviewsAria')}
      className="admin-module-panel flex w-full min-w-0 flex-col gap-3 p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 shrink-0 text-violet-500" strokeWidth={1.75} aria-hidden />
          <h2 className="m-0 text-base font-semibold text-[var(--admin-text)] sm:text-lg">
            {t('student.internshipOffers.journey.interviewsTitle')}
          </h2>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-[var(--admin-brand)] hover:underline"
          onClick={() => navigate(STUDENT_INTERVIEW_SIMULATOR_PATH)}
        >
          {t('student.internshipOffers.journey.prepareInterview')}
        </button>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {interviews.map((item) => (
          <li
            key={item.uuid}
            className="rounded-xl border border-[color-mix(in_srgb,#8b5cf6_30%,var(--admin-border))] bg-[color-mix(in_srgb,#8b5cf6_6%,var(--admin-bg-elevated))] px-3.5 py-3 sm:px-4"
          >
            <p className="m-0 text-sm font-semibold text-[var(--admin-text)]">{item.offer_title}</p>
            <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-secondary)]">{item.company_name}</p>
            <p className="m-0 mt-2 text-xs font-medium text-violet-600 dark:text-violet-400">
              {new Date(item.scheduled_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default InternshipInterviewsPanel;
