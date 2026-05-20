import { FunctionComponent } from 'react';
import { AlertCircle } from 'lucide-react';
import { taskUrgentAlert } from '../data/taskMock';

const TaskUrgentAlert: FunctionComponent = () => (
  <div
    role="alert"
    className="flex w-full min-w-0 items-start gap-2.5 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3"
  >
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fee2e2] text-[#dc2626]">
      <AlertCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
    </span>
    <div className="min-w-0 space-y-0.5">
      <p className="m-0 text-[13px] font-semibold leading-5 text-[#991b1b] sm:text-sm">{taskUrgentAlert.title}</p>
      <p className="m-0 text-[12px] leading-[1.4] text-[#b91c1c] sm:text-[13px]">{taskUrgentAlert.message}</p>
    </div>
  </div>
);

export default TaskUrgentAlert;
