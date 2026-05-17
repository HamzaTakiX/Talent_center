import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../dashboard/components/AdminLayout';
import { fadeInUp } from '../dashboard/ui/animations';
import { useAdminBackLabel, type AdminBackTarget } from '../i18n/useAdminCopy';
import AdminBackButton from './AdminBackButton';

type AdminListPageWidth = 'default' | 'wide';

const widthClass: Record<AdminListPageWidth, string> = {
  default: 'max-w-[1680px]',
  wide: 'max-w-[1600px]',
};

interface AdminListPageShellProps {
  children: ReactNode;
  onBack: () => void;
  /** @deprecated Prefer backTo for i18n */
  backLabel?: string;
  backTo?: AdminBackTarget;
  width?: AdminListPageWidth;
  className?: string;
}

/** Enveloppe sous-pages liste (retour + contenu) — alignée dashboard. */
const AdminListPageShell: FunctionComponent<AdminListPageShellProps> = ({
  children,
  onBack,
  backLabel,
  backTo = 'dashboard',
  width = 'wide',
  className = '',
}) => {
  const resolvedBack = useAdminBackLabel(backTo);
  return (
    <AdminLayout>
      <motion.div
        {...fadeInUp}
        transition={{ duration: 0.35 }}
        className={`admin-page mx-auto w-full min-w-0 space-y-5 pb-6 font-inter ${widthClass[width]} ${className}`}
      >
        <AdminBackButton onClick={onBack} label={backLabel ?? resolvedBack} />
        {children}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminListPageShell;
