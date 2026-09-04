import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

interface WorkspaceSkeletonBlockProps {
  className?: string;
}

/** Bloc shimmer réutilisable pour les états de chargement du workspace. */
export const WorkspaceSkeletonBlock: FunctionComponent<WorkspaceSkeletonBlockProps> = ({
  className = '',
}) => <div className={`student-workspace-skeleton ${className}`.trim()} aria-hidden />;

interface WorkspaceSectionBodySkeletonProps {
  rows?: number;
  rowClassName?: string;
}

export const WorkspaceSectionBodySkeleton: FunctionComponent<WorkspaceSectionBodySkeletonProps> = ({
  rows = 3,
  rowClassName = 'h-16 w-full',
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col gap-3"
      role="status"
      aria-busy="true"
      aria-label={t('student.encadrant.workspace.platform.loading', {
        defaultValue: 'Chargement…',
      })}
    >
      <span className="sr-only">
        {t('student.encadrant.workspace.platform.loading', { defaultValue: 'Chargement…' })}
      </span>
      {Array.from({ length: rows }, (_, i) => (
        <WorkspaceSkeletonBlock key={i} className={rowClassName} />
      ))}
    </div>
  );
};
