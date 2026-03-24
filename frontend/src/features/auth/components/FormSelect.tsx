import { FunctionComponent, useState, useRef, useEffect } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface FormSelectProps {
  label: string;
  error?: string;
  Icon?: LucideIcon;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FormSelect: FunctionComponent<FormSelectProps> = ({
  label,
  error,
  Icon,
  options,
  value,
  onChange,
  placeholder = "Select an option..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);
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
          setHighlightedIndex(prev => (prev + 1) % options.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
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
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const optionHeight = 44; // Actual height of each option (py-3 + text height)
      const dropdownHeight = Math.min(options.length * optionHeight, 300); // Max 300px
      const spaceBelow = window.innerHeight - rect.bottom - 40; // 40px padding
      const spaceAbove = rect.top - 40; // 40px padding
      
      // Always drop up if there's any chance of overlap with elements below
      setDropUp(spaceBelow < dropdownHeight + 50); // Extra 50px buffer
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      const currentIndex = options.findIndex(option => option.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : -1);
    }
  };

  // Reset dropUp state when closing
  useEffect(() => {
    if (!isOpen) {
      setDropUp(false);
    }
  }, [isOpen]);

  return (
    <div className="w-full flex flex-col gap-1.5 focus-within:-translate-y-[1px] transition-transform duration-300 ease-out group relative">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-darkslategray leading-none transition-colors duration-300 group-focus-within:text-mediumslateblue">{label}</label>
        {error && <div className="text-red-500 text-[11px] font-medium animate-pulse">{error}</div>}
      </div>
      <div className="relative" ref={dropdownRef} style={{ zIndex: isOpen ? 99999 : 'auto' }}>
        <button
          type="button"
          ref={buttonRef}
          onClick={handleToggle}
          className="w-full h-[44px] rounded-xl bg-whitesmoke border-lightgray border-solid border-[1px] box-border overflow-hidden text-slategray-100 transition-all duration-300 focus-within:border-mediumslateblue focus-within:ring-2 focus-within:ring-mediumslateblue/20 focus-within:bg-white focus-within:shadow-sm flex items-center px-3.5 hover:bg-white hover:border-mediumslateblue/50 hover:shadow-sm group"
        >
          {Icon && (
             <Icon className="w-4 h-4 mr-2.5 text-slategray-200 transition-colors duration-300 group-focus-within:text-mediumslateblue shrink-0" strokeWidth={2} />
          )}
          <span className={`flex-1 text-left text-darkslategray text-[14px] font-inter transition-colors truncate ${!value ? 'text-lightgray-200' : ''}`}>
            {displayValue}
          </span>
          <ChevronDown 
            className={`w-4 h-4 text-slategray-200 transition-all duration-300 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-mediumslateblue' : 'group-hover:text-mediumslateblue'}`} 
            strokeWidth={2} 
          />
        </button>

        {/* Custom Dropdown */}
        {isOpen && (
          <div 
            className="absolute w-full bg-white rounded-xl border border-lightgray/50 shadow-xl overflow-hidden"
            style={{
              top: dropUp ? 'auto' : 'calc(100% + 8px)',
              bottom: dropUp ? 'calc(100% + 8px)' : 'auto',
              left: '0',
              zIndex: 99999
            }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              {options.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3.5 py-3 cursor-pointer transition-all duration-150 text-[14px] font-inter border-b border-lightgray/20 last:border-b-0 ${
                    option.value === value 
                      ? 'bg-mediumslateblue/10 text-mediumslateblue font-medium' 
                      : highlightedIndex === index 
                        ? 'bg-slate-50 text-darkslategray'
                        : 'text-darkslategray hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
