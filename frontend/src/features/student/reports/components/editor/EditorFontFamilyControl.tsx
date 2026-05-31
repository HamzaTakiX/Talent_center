import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

import {
  FONT_FAMILY_GROUP_LABELS,
  type FontFamilyGroup,
  type FontFamilyPreset,
} from './editorConstants';
import { filterFontFamilyPresets, resolveFontFamilyLabel, resolveFontFamilyValue } from './editorFontUtils';

interface EditorFontFamilyControlProps {
  value: string;
  disabled?: boolean;
  ariaLabel: string;
  searchPlaceholder?: string;
  onSelect: (family: string) => void;
}

const GROUP_ORDER: FontFamilyGroup[] = ['sans', 'serif', 'mono', 'display'];

function groupPresets(presets: FontFamilyPreset[]): Array<{ group: FontFamilyGroup; items: FontFamilyPreset[] }> {
  return GROUP_ORDER.map((group) => ({
    group,
    items: presets.filter((p) => p.group === group),
  })).filter((section) => section.items.length > 0);
}

const EditorFontFamilyControl: FunctionComponent<EditorFontFamilyControlProps> = ({
  value,
  disabled = false,
  ariaLabel,
  searchPlaceholder = 'Search fonts…',
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const resolvedValue = resolveFontFamilyValue(value);
  const triggerLabel = resolveFontFamilyLabel(value);

  const filtered = useMemo(() => filterFontFamilyPresets(query), [query]);
  const sections = useMemo(() => groupPresets(filtered), [filtered]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    window.setTimeout(() => searchRef.current?.focus(), 30);
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

  return (
    <div
      ref={rootRef}
      className={`student-report-font-family ${disabled ? 'is-disabled' : ''}`}
    >
      <button
        type="button"
        className={`student-report-font-family__trigger ${open ? 'is-open' : ''}`}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ fontFamily: resolvedValue }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="student-report-font-family__label">{triggerLabel}</span>
        <ChevronDown className="student-report-font-family__chevron" aria-hidden />
      </button>

      {open ? (
        <div className="student-report-font-family__panel" role="presentation">
          <label className="student-report-font-family__search">
            <Search className="student-report-font-family__search-icon" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              className="student-report-font-family__search-input"
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <ul className="student-report-font-family__menu" role="listbox" aria-label={ariaLabel}>
            {sections.length === 0 ? (
              <li className="student-report-font-family__empty" role="presentation">
                —
              </li>
            ) : (
              sections.map(({ group, items }) => (
                <li key={group} role="presentation" className="student-report-font-family__section">
                  <p className="student-report-font-family__section-title">{FONT_FAMILY_GROUP_LABELS[group]}</p>
                  <ul className="student-report-font-family__section-list" role="group">
                    {items.map((font) => {
                      const active = resolvedValue === font.value;
                      return (
                        <li key={font.value} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            className={`student-report-font-family__option ${active ? 'is-active' : ''}`}
                            style={{ fontFamily: font.value }}
                            onClick={() => {
                              onSelect(font.value);
                              setOpen(false);
                            }}
                          >
                            {font.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default EditorFontFamilyControl;
