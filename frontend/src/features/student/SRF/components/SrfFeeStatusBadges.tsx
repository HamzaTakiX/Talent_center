import { FunctionComponent } from 'react';
import { CircleCheck, Clock } from 'lucide-react';
import type { SrfFeeRowStatus } from '../types';

interface SrfFeeStatusBadgesProps {
  status: SrfFeeRowStatus;
}

const SrfFeeStatusBadges: FunctionComponent<SrfFeeStatusBadgesProps> = ({ status }) => {
  if (status === 'paid') {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-inter text-xs font-semibold leading-4 text-emerald-800">
          <CircleCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Payé
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-inter text-xs font-semibold leading-4 text-emerald-800">
          <CircleCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Validé
        </span>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-inter text-xs font-semibold leading-4 text-red-700">
      <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
      À payer
    </span>
  );
};

export default SrfFeeStatusBadges;
