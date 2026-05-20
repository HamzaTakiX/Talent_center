import { FunctionComponent } from 'react';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-xl ${className}`} aria-hidden />
);

const SrfStudentDetailSkeleton: FunctionComponent = () => (
  <div className="space-y-6" aria-busy aria-label="loading">
    <Shimmer className="h-44 w-full rounded-2xl" />
    <div className="grid gap-4 lg:grid-cols-3">
      <Shimmer className="h-64 lg:col-span-2" />
      <Shimmer className="h-64" />
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <Shimmer className="h-36" />
      <Shimmer className="h-36" />
      <Shimmer className="h-36" />
    </div>
    <Shimmer className="h-28 w-full" />
    <div className="grid gap-4 lg:grid-cols-2">
      <Shimmer className="h-52" />
      <Shimmer className="h-52" />
    </div>
    <Shimmer className="h-64 w-full" />
    <Shimmer className="h-72 w-full" />
  </div>
);

export default SrfStudentDetailSkeleton;
