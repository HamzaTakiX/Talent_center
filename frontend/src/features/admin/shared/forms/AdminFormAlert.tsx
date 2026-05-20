import { FunctionComponent, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export type AdminFormAlertVariant = 'error' | 'success' | 'info';

interface AdminFormAlertProps {
  variant: AdminFormAlertVariant;
  children: ReactNode;
  className?: string;
}

const variantConfig: Record<
  AdminFormAlertVariant,
  { icon: typeof AlertCircle; className: string }
> = {
  error: { icon: AlertCircle, className: 'admin-form-alert--error' },
  success: { icon: CheckCircle2, className: 'admin-form-alert--success' },
  info: { icon: Info, className: 'admin-form-alert--info' },
};

const AdminFormAlert: FunctionComponent<AdminFormAlertProps> = ({
  variant,
  children,
  className = '',
}) => {
  const { icon: Icon, className: variantClass } = variantConfig[variant];
  return (
    <p
      role={variant === 'error' ? 'alert' : 'status'}
      className={`admin-form-alert ${variantClass} ${className}`.trim()}
    >
      <Icon className="admin-form-alert__icon shrink-0" strokeWidth={1.75} aria-hidden />
      <span>{children}</span>
    </p>
  );
};

export default AdminFormAlert;
