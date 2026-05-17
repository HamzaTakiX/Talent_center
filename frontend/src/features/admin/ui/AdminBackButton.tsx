import { FunctionComponent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const text = label ?? t('admin.back.dashboard');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-btn-secondary inline-flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-medium ${className}`}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      <span>{text}</span>
    </button>
  );
};

export default AdminBackButton;
