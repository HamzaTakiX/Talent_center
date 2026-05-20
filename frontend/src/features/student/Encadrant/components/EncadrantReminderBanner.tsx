import { FunctionComponent } from 'react';
import { Info } from 'lucide-react';
import { encadrantReminder } from '../data/encadrantMock';
import { ENCADRANT_OUTLINE_BTN } from '../constants/encadrantStyles';

const EncadrantReminderBanner: FunctionComponent = () => (
  <div
    role="alert"
    className="flex w-full min-w-0 flex-col gap-2 rounded-[12px] border border-[#fed7aa] bg-[#fff7ed] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3"
  >
    <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffedd5] text-[#ea580c]">
        <Info className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="m-0 text-[13px] font-semibold leading-5 text-[#9a3412] sm:text-sm">
          {encadrantReminder.title}
        </p>
        <p className="m-0 text-[12px] leading-[1.4] text-[#c2410c] sm:text-[13px]">{encadrantReminder.message}</p>
      </div>
    </div>
    <button type="button" className={`${ENCADRANT_OUTLINE_BTN} w-full shrink-0 sm:w-auto`}>
      {encadrantReminder.actionLabel}
    </button>
  </div>
);

export default EncadrantReminderBanner;
