import { FunctionComponent } from 'react';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminBackButton from '../../ui/AdminBackButton';

interface BackToAdminButtonProps {
  onClick: () => void;
}

const BackToAdminButton: FunctionComponent<BackToAdminButtonProps> = ({ onClick }) => {
  const backLabel = useAdminBackLabel('administrators');
  return <AdminBackButton onClick={onClick} label={backLabel} />;
};

export default BackToAdminButton;
