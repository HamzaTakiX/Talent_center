import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { colorsMatch, parseColorInput } from './editorColorUtils';

interface EditorColorPickerProps {
  label: string;
  value: string;
  presets: string[];
  onApply: (color: string) => void;
  onClear?: () => void;
  onBeforeOpen?: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  allowClear?: boolean;
}

const EditorColorPicker: FunctionComponent<EditorColorPickerProps> = ({
  label,
  value,
  presets,
  onApply,
  onClear,
  onBeforeOpen,
  icon,
  disabled = false,
  allowClear = false,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [rgbInput, setRgbInput] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const applyColor = (raw: string) => {
    const parsed = parseColorInput(raw);
    if (!parsed) return;
    onApply(parsed);
    setHexInput(parsed);
    setOpen(false);
  };

  const toggleOpen = () => {
    if (disabled) return;
    onBeforeOpen?.();
    setOpen((o) => !o);
  };

  return (
    <div ref={rootRef} className="student-report-color-picker">
      <button
        type="button"
        className="student-report-toolbar-btn student-report-color-picker__trigger"
        title={label}
        aria-label={label}
        aria-expanded={open}
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggleOpen}
      >
        {icon}
        <span className="student-report-color-picker__swatch" style={{ backgroundColor: value }} aria-hidden />
      </button>

      {open ? (
        <div className="student-report-color-picker__panel" role="dialog" aria-label={label}>
          <p className="student-report-color-picker__heading">{label}</p>
          <div className="student-report-color-picker__presets">
            {presets.map((color) => (
              <button
                key={color}
                type="button"
                className={`student-report-color-picker__preset ${colorsMatch(value, color) ? 'is-active' : ''}`}
                style={{ backgroundColor: color }}
                title={color}
                aria-label={color}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor(color)}
              />
            ))}
          </div>

          {allowClear ? (
            <button
              type="button"
              className="student-report-color-picker__clear"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onClear?.();
                setOpen(false);
              }}
            >
              {t('student.reports.editor.removeHighlight')}
            </button>
          ) : null}

          <label className="student-report-color-picker__field">
            <span>{t('student.reports.editor.colorPicker.custom')}</span>
            <input
              type="color"
              value={parseColorInput(hexInput) ?? '#1e293b'}
              disabled={disabled}
              onChange={(e) => applyColor(e.target.value)}
            />
          </label>

          <label className="student-report-color-picker__field">
            <span>{t('student.reports.editor.colorPicker.hex')}</span>
            <input
              type="text"
              value={hexInput}
              placeholder="#2563eb"
              onChange={(e) => setHexInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyColor(hexInput);
              }}
              onBlur={() => applyColor(hexInput)}
            />
          </label>

          <label className="student-report-color-picker__field">
            <span>{t('student.reports.editor.colorPicker.rgb')}</span>
            <input
              type="text"
              value={rgbInput}
              placeholder="rgb(37, 99, 235)"
              onChange={(e) => setRgbInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyColor(rgbInput);
              }}
              onBlur={() => {
                if (rgbInput.trim()) applyColor(rgbInput);
              }}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
};

export default EditorColorPicker;
