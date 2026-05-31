import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { FONT_SIZE_PRESETS } from './editorConstants';
import { normalizeFontSize } from './editorCommands';

interface EditorFontSizeControlProps {
  value: string;
  disabled?: boolean;
  presets?: string[];
  ariaLabel: string;
  customPlaceholder: string;
  onSelect: (size: string) => void;
}

function displaySize(size: string): string {
  return size.replace('px', '');
}

const EditorFontSizeControl: FunctionComponent<EditorFontSizeControlProps> = ({
  value,
  disabled = false,
  presets = FONT_SIZE_PRESETS,
  ariaLabel,
  customPlaceholder,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const isPreset = presets.includes(value);
  const triggerLabel = displaySize(value);
  const inputValue = customDraft || (!isPreset ? displaySize(value) : '');

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocPointer);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onDocPointer);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const applyCustom = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    onSelect(normalizeFontSize(trimmed));
    setCustomDraft('');
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`student-report-font-size ${disabled ? 'is-disabled' : ''}`}
    >
      <div className="student-report-font-size__cluster">
        <button
          type="button"
          className={`student-report-font-size__trigger ${open ? 'is-open' : ''}`}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="student-report-font-size__value">{triggerLabel}</span>
          <ChevronDown className="student-report-font-size__chevron" aria-hidden />
        </button>

        <span className="student-report-font-size__divider" aria-hidden />

        <div className="student-report-font-size__custom">
          <input
            type="text"
            inputMode="numeric"
            className="student-report-font-size__input"
            value={inputValue}
            disabled={disabled}
            placeholder={customPlaceholder}
            aria-label={customPlaceholder}
            onChange={(e) => setCustomDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              applyCustom((e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => applyCustom(e.target.value)}
          />
          <span className="student-report-font-size__suffix">px</span>
        </div>
      </div>

      {open ? (
        <ul className="student-report-font-size__menu" role="listbox" aria-label={ariaLabel}>
          {presets.map((size) => {
            const active = value === size;
            return (
              <li key={size} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`student-report-font-size__option ${active ? 'is-active' : ''}`}
                  onClick={() => {
                    onSelect(size);
                    setCustomDraft('');
                    setOpen(false);
                  }}
                >
                  <span>{displaySize(size)}</span>
                  <span className="student-report-font-size__option-unit">px</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default EditorFontSizeControl;
