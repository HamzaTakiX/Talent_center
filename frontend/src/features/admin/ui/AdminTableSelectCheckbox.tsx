import { FunctionComponent } from 'react';
import { Check, Minus } from 'lucide-react';

interface AdminTableSelectCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
  disabled?: boolean;
}

const AdminTableSelectCheckbox: FunctionComponent<AdminTableSelectCheckboxProps> = ({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
  disabled = false,
}) => {
  const active = checked || indeterminate;

  return (
    <label
      className={[
        'admin-table-select-checkbox',
        active ? 'admin-table-select-checkbox--active' : '',
        disabled ? 'admin-table-select-checkbox--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <span className="admin-table-select-checkbox__box" aria-hidden>
        {indeterminate && !checked ? (
          <Minus className="admin-table-select-checkbox__icon" strokeWidth={2.75} />
        ) : (
          <Check
            className={`admin-table-select-checkbox__icon${checked ? ' is-visible' : ''}`}
            strokeWidth={2.75}
          />
        )}
      </span>
    </label>
  );
};

export default AdminTableSelectCheckbox;
