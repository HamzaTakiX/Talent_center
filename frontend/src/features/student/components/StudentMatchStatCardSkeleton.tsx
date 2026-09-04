import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import StudentSkeletonBlock from '../internship_offers/components/loading/StudentSkeletonBlock';

interface StudentMatchStatCardSkeletonProps {
  index?: number;
}

const StudentMatchStatCardSkeleton: FunctionComponent<StudentMatchStatCardSkeletonProps> = ({
  index = 0,
}) => (
  <motion.article
    className="admin-students-stat-card admin-students-stat-card--compact admin-students-stat-card--rate"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    aria-hidden
  >
    <div className="admin-students-stat-card__body">
      <div className="admin-students-stat-card__head">
        <StudentSkeletonBlock className="h-8 w-8 shrink-0 rounded-lg" />
        <StudentSkeletonBlock className="h-3 w-16 rounded-full" />
      </div>
      <StudentSkeletonBlock className="h-7 w-14 rounded-md" />
      <StudentSkeletonBlock className="h-5 w-20 rounded-full" />
    </div>
    <StudentSkeletonBlock className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-full" />
  </motion.article>
);

export default StudentMatchStatCardSkeleton;
