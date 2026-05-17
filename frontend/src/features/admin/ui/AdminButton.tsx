import { ButtonHTMLAttributes, FunctionComponent, ReactNode } from 'react';

export type AdminButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'surface'
  | 'reset'
  | 'danger';

export type AdminButtonSize = 'sm' | 'md' | 'lg';

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClass: Record<AdminButtonVariant, string> = {
  primary: 'admin-btn-primary',
  secondary: 'admin-btn-secondary',
  outline: 'admin-btn-outline',
  ghost: 'admin-btn-ghost',
  surface: 'admin-btn-surface',
  reset: 'admin-btn-reset',
  danger:
    'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60',
};

const AdminButton: FunctionComponent<AdminButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`admin-btn admin-btn--${size} ${variantClass[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default AdminButton;
