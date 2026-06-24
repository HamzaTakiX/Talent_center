import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import StudentSkeletonBlock from '../internship_offers/components/loading/StudentSkeletonBlock';

interface StudentMatchStatCardSkeletonProps {
  index?: number;
  showTrack?: boolean;
}

const StudentMatchStatCardSkeleton: FunctionComponent<StudentMatchStatCardSkeletonProps> = ({
  index = 0,
  showTrack = true,
}) => (
  <motion.div
    className="student-match-stat-card student-match-stat-card--skeleton"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    aria-hidden
  >
    <StudentSkeletonBlock className="h-8 w-8 shrink-0 rounded-lg" />
    <div className="student-match-stat-card__body">
      <StudentSkeletonBlock className="h-2.5 w-[72%] rounded-full" />
      <StudentSkeletonBlock className="h-6 w-[48%] rounded-md" />
    </div>
    {showTrack ? <StudentSkeletonBlock className="student-match-stat-card__track-skeleton mt-auto" /> : null}
  </motion.div>
);

export default StudentMatchStatCardSkeleton;
