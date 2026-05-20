import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { AdminSectionSkeletonShell } from '../../../ui/AdminSectionSkeleton';

const MeetingsCalendarSkeleton: FunctionComponent = () => (
  <AdminSectionSkeletonShell className="admin-meetings-calendar-skeleton">
    <div className="admin-meetings-calendar-skeleton__toolbar" aria-hidden>
      <motion.div className="admin-shimmer admin-meetings-calendar-skeleton__pill" />
      <div className="admin-meetings-calendar-skeleton__tabs">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div key={i} className="admin-shimmer admin-meetings-calendar-skeleton__tab" />
        ))}
      </div>
    </div>
    <motion.div className="admin-meetings-calendar-skeleton__grid" aria-hidden>
      {Array.from({ length: 35 }).map((_, i) => (
        <motion.div key={i} className="admin-shimmer admin-meetings-calendar-skeleton__cell" />
      ))}
    </motion.div>
  </AdminSectionSkeletonShell>
);

export default MeetingsCalendarSkeleton;
