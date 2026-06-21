import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useBackNavigation } from '../../../shared/navigation/useBackNavigation';

interface AdminBackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

const AdminBackButton: FunctionComponent<AdminBackButtonProps> = ({
  onClick,
  label,
  className = '',
}) => {
  const { t } = useTranslation();
  const { BackIcon, rowClassName, controlClassName } = useBackNavigation();
  const text = label ?? t('admin.back.dashboard');

  return (
    <div className={[rowClassName, className].filter(Boolean).join(' ')}>
      <button
        type="button"
        onClick={onClick}
        className={`admin-btn-secondary ${controlClassName} inline-flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-medium`}
      >
        <BackIcon className="h-4 w-4 shrink-0" aria-hidden />
        <span>{text}</span>
      </button>
    </div>
  );
};

export default AdminBackButton;
