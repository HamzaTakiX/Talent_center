import { FunctionComponent } from 'react';

interface StudentSkeletonBlockProps {
  className?: string;
}

const StudentSkeletonBlock: FunctionComponent<StudentSkeletonBlockProps> = ({ className = '' }) => (
  <div className={`admin-shimmer rounded-md ${className}`} aria-hidden />
);

export default StudentSkeletonBlock;
