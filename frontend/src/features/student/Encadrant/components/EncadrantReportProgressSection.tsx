import { FunctionComponent } from 'react';
import { LineChart } from 'lucide-react';
import {
  encadrantGlobalReportProgress,
  encadrantReportChapters,
} from '../data/encadrantMock';
import { ENCADRANT_OUTLINE_BTN, ENCADRANT_PRIMARY_BTN } from '../constants/encadrantStyles';
import { ENCADRANT_SURFACE_CARD } from '../constants/encadrantLayout';

const ProgressBar: FunctionComponent<{ label: string; progress: number; thin?: boolean }> = ({
  label,
  progress,
  thin = false,
}) => (
  <div className="min-w-0">
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <span className="min-w-0 truncate font-inter text-[13px] font-medium leading-5 text-[var(--admin-text)] sm:text-sm">
        {label}
      </span>
      <span className="shrink-0 font-inter text-[13px] font-semibold tabular-nums leading-5 text-[#2563eb] sm:text-sm">
        {progress}%
      </span>
    </div>
    <div
      className={`w-full overflow-hidden rounded-full bg-[#e5e7eb] ${thin ? 'h-2' : 'h-3'}`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label} ${progress}%`}
    >
      <div
        className={`h-full rounded-full bg-[#030213] transition-[width] duration-300 ${thin ? 'h-2' : 'h-3'}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

const EncadrantReportProgressSection: FunctionComponent = () => (
  <section aria-label="Progression du rapport" className={`${ENCADRANT_SURFACE_CARD} min-w-0`}>
    <div className="border-b border-solid border-[var(--admin-border)] px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-center gap-2">
        <LineChart className="h-5 w-5 shrink-0 text-[var(--admin-text)]" strokeWidth={1.75} aria-hidden />
        <h2 className="m-0 font-inter text-lg font-bold leading-7 text-[var(--admin-text)]">Progression du rapport</h2>
      </div>
      <p className="m-0 mt-1 font-inter text-[13px] leading-5 text-[var(--admin-text-muted)] sm:text-sm">
        Avancement de votre rapport de stage
      </p>
    </div>

    <div className="space-y-5 p-4 sm:space-y-6 sm:p-5">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-inter text-sm font-medium leading-5 text-[var(--admin-text)]">Progression globale</span>
          <span className="font-inter text-sm font-bold tabular-nums leading-5 text-[#2563eb]">
            {encadrantGlobalReportProgress}%
          </span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-[#e5e7eb]"
          role="progressbar"
          aria-valuenow={encadrantGlobalReportProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progression globale ${encadrantGlobalReportProgress}%`}
        >
          <div
            className="h-3 rounded-full bg-[#030213] transition-[width] duration-300"
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
        <button type="button" className={`${ENCADRANT_OUTLINE_BTN} w-full sm:w-auto`}>
          Voir rapport
        </button>
        <button type="button" className={`${ENCADRANT_PRIMARY_BTN} w-full sm:w-auto`}>
          Continuer l&apos;écriture
        </button>
      </div>
    </div>
  </section>
);

export default EncadrantReportProgressSection;
