import { FunctionComponent } from 'react';
import { AdminSectionSkeletonShell } from '../../../admin/ui/AdminSectionSkeleton';

interface StudentAnnouncementsFeedSkeletonProps {
  count?: number;
  variant?: 'list' | 'grid';
  className?: string;
}

const StudentAnnouncementsFeedSkeleton: FunctionComponent<StudentAnnouncementsFeedSkeletonProps> = ({
  count = 4,
  variant = 'list',
  className = '',
}) => (
  <AdminSectionSkeletonShell className={className}>
    <div
      className={
        variant === 'grid'
          ? 'student-announcement-card-grid w-full min-w-0'
          : 'student-announcement-card-stack w-full min-w-0'
      }
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-shimmer admin-ann-skeleton-card student-ann-skeleton-card" />
      ))}
    </div>
  </AdminSectionSkeletonShell>
);

export default StudentAnnouncementsFeedSkeleton;
