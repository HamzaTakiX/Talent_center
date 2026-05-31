import { FunctionComponent, ReactNode } from 'react';
import { CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import type { CvAnalysisColumnData, CvAnalysisSubsection } from '../../types/cvAnalysis';

type CvAnalysisTheme = 'strengths' | 'weaknesses' | 'improvements';

interface CvAnalysisColumnCardProps {
  theme: CvAnalysisTheme;
  title: string;
  icon: ReactNode;
  data: CvAnalysisColumnData;
}

const themePanelClass: Record<CvAnalysisTheme, string> = {
  strengths:
    'admin-module-panel border border-solid border-[color-mix(in_srgb,#22c55e_22%,var(--admin-border))]',
  weaknesses:
    'admin-module-panel border border-solid border-[color-mix(in_srgb,#ef4444_22%,var(--admin-border))]',
  improvements:
    'admin-module-panel border border-solid border-[color-mix(in_srgb,var(--admin-brand)_22%,var(--admin-border))]',
};

const themeBullet: Record<CvAnalysisTheme, ReactNode> = {
  strengths: <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={2} aria-hidden />,
  weaknesses: <XCircle className="h-4 w-4 text-red-500" strokeWidth={2} aria-hidden />,
  improvements: <Sparkles className="h-4 w-4 text-[var(--admin-brand)]" strokeWidth={2} aria-hidden />,
};

const CvAnalysisSubsectionBlock: FunctionComponent<{
  subsection: CvAnalysisSubsection;
  bullet: ReactNode;
}> = ({ subsection, bullet }) => (
  <div className="mb-4 last:mb-0">
    <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
      {subsection.title}
    </p>
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {subsection.items.map((item) => (
        <li key={`${subsection.title}-${item.label}`} className="flex min-w-0 items-start gap-2 text-sm leading-5 text-[var(--admin-text-secondary)]">
          <span className="mt-0.5 shrink-0">{bullet}</span>
          <span className="min-w-0 break-words">
            <strong className="font-semibold text-[var(--admin-text)]">{item.label}</strong>
            {item.description != null && item.description !== '' ? (
              <span>: {item.description}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const CvAnalysisColumnCard: FunctionComponent<CvAnalysisColumnCardProps> = ({
  theme,
  title,
  icon,
  data,
}) => {
  const subsections = [
    data.matchingSkills,
    data.relevantExperience,
    data.missingSkills,
    data.weakSections,
    data.actionableSuggestions,
    data.quickWins,
  ].filter((s): s is CvAnalysisSubsection => s != null);

  return (
    <article
      className={`box-border flex h-full w-full min-w-0 max-w-full flex-col rounded-[12px] px-4 py-5 sm:px-5 sm:py-6 ${themePanelClass[theme]}`}
    >
      <div className="mb-4 flex min-w-0 items-center gap-2 text-[var(--admin-text)]">
        {icon}
        <h2 className="m-0 text-base font-semibold leading-6">{title}</h2>
      </div>

      {subsections.map((subsection) => (
        <CvAnalysisSubsectionBlock
          key={subsection.title}
          subsection={subsection}
          bullet={themeBullet[theme]}
        />
      ))}
    </article>
  );
};

export default CvAnalysisColumnCard;
