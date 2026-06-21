import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, CircleDashed } from 'lucide-react';
import type { ApplicationReadiness } from '../../types/journeyTypes';
import { STUDENT_PRIMARY_BUTTON, STUDENT_SECONDARY_BUTTON } from '../../../design-system/studentTokens';
import { STUDENT_CV_ANALYSIS_TOOL_PATH } from '../../CV_Analyse/constants/routes';

interface ApplicationReadinessChecklistProps {
  readiness: ApplicationReadiness;
  onApply?: () => void;
  applying?: boolean;
}

const CHECKLIST_ACTIONS: Record<string, string> = {
  upload_cv: '/cv-editor',
  complete_profile: '/complete-profile',
  view_eligibility: '#',
};

const ApplicationReadinessChecklist: FunctionComponent<ApplicationReadinessChecklistProps> = ({
  readiness,
  onApply,
  applying = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section
      aria-label={t('student.internshipOffers.journey.readinessAria')}
      className="admin-module-panel flex w-full min-w-0 flex-col gap-4 p-4 sm:p-5"
    >
      <div>
        <h2 className="m-0 text-base font-semibold text-[var(--admin-text)]">
          {t('student.internshipOffers.journey.readinessTitle')}
        </h2>
        <p className="m-0 mt-1 text-sm text-[var(--admin-text-secondary)]">
          {t('student.internshipOffers.journey.readinessSubtitle')}
        </p>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {readiness.checklist.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              disabled={item.done}
              onClick={() => {
                const href = CHECKLIST_ACTIONS[item.action];
                if (href && href !== '#') navigate(href);
              }}
              className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left sm:px-4 ${
                item.done
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] hover:bg-[var(--admin-bg-subtle)]'
              }`}
            >
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" strokeWidth={1.75} />
              ) : (
                <CircleDashed className="h-5 w-5 shrink-0 text-[var(--admin-text-muted)]" strokeWidth={1.75} />
              )}
              <span className={`text-sm font-medium ${item.done ? 'text-emerald-700 dark:text-emerald-400' : 'text-[var(--admin-text)]'}`}>
                {t(`student.internshipOffers.journey.checklist.${item.label_key}`)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {readiness.missing_skills.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {t('student.internshipOffers.journey.missingSkills')}
          </p>
          <p className="m-0 mt-1 text-sm text-[var(--admin-text-secondary)]">
            {readiness.missing_skills.join(', ')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        {readiness.already_applied ? (
          <p className="m-0 text-sm font-medium text-[var(--admin-brand)]">
            {t('student.internshipOffers.journey.alreadyApplied')}
          </p>
        ) : (
          <button
            type="button"
            className={STUDENT_PRIMARY_BUTTON}
            disabled={!readiness.can_apply || applying}
            onClick={onApply}
          >
            {applying
              ? t('student.common.loading')
              : t('student.internshipOffers.journey.submitApplication')}
          </button>
        )}
        <button
          type="button"
          className={STUDENT_SECONDARY_BUTTON}
          onClick={() => navigate(STUDENT_CV_ANALYSIS_TOOL_PATH)}
        >
          {t('student.internshipOffers.apply.analyzeCv')}
        </button>
      </div>
    </section>
  );
};

export default ApplicationReadinessChecklist;
