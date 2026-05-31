import { FunctionComponent } from 'react';
import { Info } from 'lucide-react';
import { encadrantReminder } from '../data/encadrantMock';
import { ENCADRANT_OUTLINE_BTN } from '../constants/encadrantStyles';
import {
  STUDENT_CALLOUT_WARNING,
  STUDENT_ICON_CHIP_WARNING,
} from '../../design-system/studentSemanticStyles';

const EncadrantReminderBanner: FunctionComponent = () => (
  <div
    role="alert"
    className={`flex w-full min-w-0 flex-col gap-2 ${STUDENT_CALLOUT_WARNING} px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3`}
  >
    <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
      <span className={`inline-flex h-8 w-8 shrink-0 ${STUDENT_ICON_CHIP_WARNING}`}>
        <Info className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="m-0 text-[13px] font-semibold leading-5 text-[var(--admin-text)] sm:text-sm">
          {encadrantReminder.title}
        </p>
        <p className="m-0 text-[12px] leading-[1.4] text-[var(--admin-text-secondary)] sm:text-[13px]">
          {encadrantReminder.message}
        </p>
      </div>
    </div>
    <button type="button" className={`${ENCADRANT_OUTLINE_BTN} w-full shrink-0 sm:w-auto`}>
      {encadrantReminder.actionLabel}
    </button>
  </div>
);

export default EncadrantReminderBanner;
