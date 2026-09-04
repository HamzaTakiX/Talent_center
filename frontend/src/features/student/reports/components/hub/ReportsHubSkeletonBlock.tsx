import { FunctionComponent } from 'react';

interface ReportsHubSkeletonBlockProps {
  className?: string;
}

const ReportsHubSkeletonBlock: FunctionComponent<ReportsHubSkeletonBlockProps> = ({
  className = '',
}) => <div className={`sr-hub-skeleton ${className}`.trim()} aria-hidden />;

export default ReportsHubSkeletonBlock;
