import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import AdminSearchEmptyState from '../../admin/ui/AdminSearchEmptyState';

export interface StudentSearchEmptyStateProps {
  /** Texte titre explicite (prioritaire sur titleKey). */
  title?: string;
  description?: string;
  titleKey?: string;
  descriptionKey?: string;
  variant?: 'panel' | 'inline';
  className?: string;
}

const StudentSearchEmptyState: FunctionComponent<StudentSearchEmptyStateProps> = ({
  title,
  description,
  titleKey = 'student.common.searchEmpty.title',
  descriptionKey = 'student.common.searchEmpty.description',
  variant = 'panel',
  className,
}) => {
  const { t } = useTranslation();

  return (
    <AdminSearchEmptyState
      title={title}
      description={description}
      titleKey={title ? undefined : titleKey}
      descriptionKey={description ? undefined : descriptionKey}
      variant={variant}
      className={['w-full min-w-0 max-w-full box-border', className].filter(Boolean).join(' ')}
    />
  );
};

export default StudentSearchEmptyState;
