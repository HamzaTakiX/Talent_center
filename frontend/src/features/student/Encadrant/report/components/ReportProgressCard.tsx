import type { ReportProgressData } from '../types';
import { REPORT_SURFACE_CARD } from '../constants/reportLayout';
import { REPORT_PROGRESS_FILL, REPORT_PROGRESS_TRACK } from '../constants/reportStyles';

interface ReportProgressCardProps {
  progress: ReportProgressData;
}

export default function ReportProgressCard({ progress }: ReportProgressCardProps) {
  return (
    <section className={`${REPORT_SURFACE_CARD} p-4`}>
      <h2 className="m-0 font-inter text-[15px] font-semibold leading-5 text-[var(--admin-text)]">
        Progression
      </h2>
      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-inter text-[13px] font-medium leading-5 text-[var(--admin-text)]">
            Complétion
          </span>
          <span className="font-inter text-[13px] font-semibold leading-5 text-[var(--admin-text)]">
            {progress.completionPercent}%
          </span>
        </div>
        <div className={`mt-2 ${REPORT_PROGRESS_TRACK}`}>
          <div
            className={REPORT_PROGRESS_FILL}
            style={{ width: `${progress.completionPercent}%` }}
            role="progressbar"
            aria-valuenow={progress.completionPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="m-0 mt-2 font-inter text-[12px] leading-4 text-[var(--admin-text-muted)]">
          {progress.currentWords} / {progress.targetWords} mots
        </p>
      </div>
    </section>
  );
}
