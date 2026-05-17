import { ChangeEvent, FunctionComponent, InputHTMLAttributes, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface AdminSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
  onClear?: () => void;
}

const AdminSearchInput: FunctionComponent<AdminSearchInputProps> = ({
  className = '',
  containerClassName = '',
  value,
  onClear,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value != null && String(value).length > 0;

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (props.onChange) {
      const synthetic = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as ChangeEvent<HTMLInputElement>;
      props.onChange(synthetic);
    }
    inputRef.current?.focus();
  };

  return (
    <label className={`admin-search-wrap ${containerClassName}`}>
      <Search className="admin-search-icon" strokeWidth={2} aria-hidden />
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        value={value}
        className={`admin-search-field ${hasValue ? 'admin-search-field--has-clear' : ''} ${className}`}
        {...props}
      />
      {hasValue && (
        <button
          type="button"
          className="admin-search-clear"
          onClick={handleClear}
          aria-label="Clear search"
          tabIndex={-1}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
      )}
    </label>
  );
};

export default AdminSearchInput;
