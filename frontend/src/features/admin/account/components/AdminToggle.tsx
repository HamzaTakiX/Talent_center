import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';

interface AdminToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const AdminToggle: FunctionComponent<AdminToggleProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => (
  <label
    htmlFor={id}
    className={`admin-toggle-row flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-[var(--admin-border)] hover:bg-[var(--admin-brand-muted)] ${
      disabled ? 'cursor-not-allowed opacity-60' : ''
    }`}
  >
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium text-[var(--admin-text)]">{label}</span>
      {description != null && description !== '' && (
        <span className="mt-0.5 block text-xs text-[var(--admin-text-secondary)]">{description}</span>
      )}
    </span>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
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

export default AdminToggle;
