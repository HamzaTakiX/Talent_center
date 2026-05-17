import { FunctionComponent } from 'react';

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-lg ${className}`} aria-hidden />
);

export const ProfilePageSkeleton: FunctionComponent = () => (
  <div className="space-y-6">
    <Shimmer className="h-32 w-full rounded-admin-xl" />
    <Shimmer className="h-48 w-full rounded-admin-lg" />
    <div className="grid gap-6 lg:grid-cols-3">
      <Shimmer className="h-72 rounded-admin-lg lg:col-span-2" />
      <Shimmer className="h-72 rounded-admin-lg" />
    </div>
  </div>
);

export const SettingsPageSkeleton: FunctionComponent = () => (
  <div className="space-y-6">
    <Shimmer className="h-28 w-full rounded-admin-xl" />
    {Array.from({ length: 4 }).map((_, i) => (
      <Shimmer key={i} className="h-40 w-full rounded-admin-lg" />
    ))}
  </div>
);
