import { FunctionComponent, useState, useRef, useEffect } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';
import '../styles/auth-form.css';

interface FormSelectProps {
  label: string;
  error?: string;
  Icon?: LucideIcon;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const FormSelect: FunctionComponent<FormSelectProps> = ({
  label,
  error,
  Icon,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % options.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          break;
        default:
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, options, onChange]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const optionHeight = 44;
      const dropdownHeight = Math.min(options.length * optionHeight, 300);
      const spaceBelow = window.innerHeight - rect.bottom - 40;
      setDropUp(spaceBelow < dropdownHeight + 50);
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      const currentIndex = options.findIndex((option) => option.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : -1);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setDropUp(false);
    }
  }, [isOpen]);

  return (
    <div
      className={`auth-select-field auth-form-field group relative flex w-full flex-col gap-1.5 transition-transform duration-300 ease-out focus-within:-translate-y-px ${error ? 'auth-form-field--error' : ''}`}
    >
      <div className="flex items-center justify-between">
        <label className="auth-form-field__label text-[13px] font-medium leading-none">{label}</label>
        {error ? <div className="auth-form-field__hint text-[11px] font-medium animate-pulse">{error}</div> : null}
      </div>
      <div className="relative" ref={dropdownRef} style={{ zIndex: isOpen ? 99999 : 'auto' }}>
        <button
          type="button"
          ref={buttonRef}
          onClick={handleToggle}
          aria-expanded={isOpen}
          disabled={disabled}
          className={`auth-select-trigger group ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {Icon ? (
            <Icon className="auth-select-trigger__icon me-2.5 h-4 w-4 shrink-0" strokeWidth={2} />
          ) : null}
          <span
            className={`auth-select-trigger__value ${!value ? 'auth-select-trigger__value--placeholder' : ''}`}
          >
            {displayValue}
          </span>
          <ChevronDown
            className={`auth-select-trigger__icon ms-2 h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
        </button>

        {isOpen ? (
          <div
            className="auth-select-dropdown absolute w-full overflow-hidden"
            style={{
              top: dropUp ? 'auto' : 'calc(100% + 8px)',
              bottom: dropUp ? 'calc(100% + 8px)' : 'auto',
              left: 0,
              zIndex: 99999,
            }}
          >
            <div className="max-h-[300px] overflow-y-auto">
              {options.map((option, index) => (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleOptionClick(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`auth-select-option ${
                    option.value === value
                      ? 'auth-select-option--selected'
                      : highlightedIndex === index
                        ? 'auth-select-option--highlight'
                        : ''
                  }`}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
