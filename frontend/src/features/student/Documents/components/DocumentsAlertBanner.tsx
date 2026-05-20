import { FunctionComponent } from 'react';
import { Info } from 'lucide-react';
import { documentsMissingAlert } from '../data/documentsMock';

const DocumentsAlertBanner: FunctionComponent = () => (
  <div
    role="alert"
    className="flex w-full min-w-0 flex-col gap-2 rounded-[12px] border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2.5 max-[429px]:gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-3.5 sm:py-3"
  >
    <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-2.5">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[#2563eb] sm:h-8 sm:w-8">
        <Info className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="m-0 text-[13px] font-semibold leading-4 text-[#1d4ed8] sm:text-sm sm:leading-5">
          {documentsMissingAlert.title}
        </p>
        <p className="m-0 text-[11px] leading-4 text-[#1e40af] max-[429px]:leading-[1.35] sm:text-[12px] sm:leading-[1.4]">
          {documentsMissingAlert.message}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => console.log('Voir détails documents manquants')}
      className="inline-flex h-8 w-full shrink-0 items-center justify-center rounded-[8px] border border-[#bfdbfe] bg-[var(--admin-bg-elevated)] px-3 text-[12px] font-medium leading-4 text-[#1d4ed8] shadow-sm transition-colors hover:bg-[#f8fafc] sm:h-8 sm:w-auto sm:px-3.5 sm:text-[13px]"
    >
      {documentsMissingAlert.actionLabel}
    </button>
  </div>
);

export default DocumentsAlertBanner;
