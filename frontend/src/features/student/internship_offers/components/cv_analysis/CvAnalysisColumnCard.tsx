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

const themeStyles: Record<
  CvAnalysisTheme,
  { border: string; title: string; subsection: string; bullet: ReactNode }
> = {
  strengths: {
    border: 'border-[#bbf7d0] bg-[var(--admin-bg-elevated)]',
    title: 'text-[#166534]',
    subsection: 'text-[#15803d]',
    bullet: <CheckCircle2 className="h-4 w-4 text-[#22c55e]" strokeWidth={2} aria-hidden />,
  },
  weaknesses: {
    border: 'border-[#fecaca] bg-[var(--admin-bg-elevated)]',
    title: 'text-[#991b1b]',
    subsection: 'text-[#b91c1c]',
    bullet: <XCircle className="h-4 w-4 text-[#ef4444]" strokeWidth={2} aria-hidden />,
  },
  improvements: {
    border: 'border-[#bfdbfe] bg-[var(--admin-bg-elevated)]',
    title: 'text-[#1e40af]',
    subsection: 'text-[#1d4ed8]',
    bullet: <Sparkles className="h-4 w-4 text-[#155dfc]" strokeWidth={2} aria-hidden />,
  },
};

const CvAnalysisSubsectionBlock: FunctionComponent<{
  subsection: CvAnalysisSubsection;
  subsectionTitleClass: string;
  bullet: ReactNode;
}> = ({ subsection, subsectionTitleClass, bullet }) => (
  <div className="mb-4 last:mb-0">
    <p className={`m-0 mb-2 text-xs font-semibold uppercase tracking-wide ${subsectionTitleClass}`}>
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
  const styles = themeStyles[theme];
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
      className={`box-border flex h-full w-full min-w-0 max-w-full flex-col rounded-[12px] border border-solid px-4 py-5 sm:px-5 sm:py-6 ${styles.border}`}
    >
      <div className={`mb-4 flex min-w-0 items-center gap-2 ${styles.title}`}>
        {icon}
        <h2 className="m-0 text-base font-semibold leading-6">{title}</h2>
      </div>

      {subsections.map((subsection) => (
        <CvAnalysisSubsectionBlock
          key={subsection.title}
          subsection={subsection}
          subsectionTitleClass={styles.subsection}
          bullet={styles.bullet}
        />
      ))}
    </article>
  );
};

export default CvAnalysisColumnCard;
