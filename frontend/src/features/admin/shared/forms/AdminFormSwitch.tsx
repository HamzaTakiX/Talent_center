import { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface AdminFormSwitchProps {
  id: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  /** spread = label left / switch right (forms); inline = label beside switch (toolbars). */
  layout?: 'spread' | 'inline';
}

/** Interrupteur formulaire admin (bleu actif, aligné sur AdminToggle). */
const AdminFormSwitch: FunctionComponent<AdminFormSwitchProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  layout = 'spread',
}) => {
  const isInline = layout === 'inline';

  return (
  <label
    htmlFor={id}
    className={`admin-form-switch flex cursor-pointer items-center rounded-lg transition-colors hover:bg-[var(--admin-brand-muted)]/40 ${
      isInline ? 'w-fit justify-start gap-2.5 py-0' : 'justify-between gap-4 py-2'
    } ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
  >
    <span
      className={`text-sm leading-snug text-[var(--admin-text)] ${
        isInline ? 'shrink-0 whitespace-nowrap' : 'min-w-0 flex-1'
      }`}
    >
      {label}
    </span>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        if (!disabled) onChange(!checked);
      }}
      className={`admin-toggle relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg-elevated)] ${
        checked ? 'admin-toggle--on' : 'admin-toggle--off'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`admin-toggle-thumb absolute top-1 h-5 w-5 rounded-full ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  </label>
  );
};

export default AdminFormSwitch;
