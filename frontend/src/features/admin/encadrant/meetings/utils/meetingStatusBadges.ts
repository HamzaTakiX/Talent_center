export const meetingStatusBadgeClass: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/12 text-blue-700 border-blue-500/35',
  CONFIRMED: 'bg-indigo-500/12 text-indigo-700 border-indigo-500/35',
  IN_PROGRESS: 'bg-amber-500/12 text-amber-700 border-amber-500/35',
  COMPLETED: 'bg-emerald-500/12 text-emerald-700 border-emerald-500/35',
  DELAYED: 'bg-orange-500/12 text-orange-700 border-orange-500/35',
  RESCHEDULED: 'bg-violet-500/12 text-violet-700 border-violet-500/35',
  CANCELLED: 'bg-slate-500/12 text-slate-600 border-slate-500/30',
  MISSED: 'bg-red-500/12 text-red-600 border-red-500/35',
  NEEDS_FOLLOWUP: 'bg-rose-500/12 text-rose-700 border-rose-500/35',
};

export const meetingPriorityClass: Record<string, string> = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600 font-semibold',
};
