import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Droplet, Pipette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BACKGROUND_PRESETS } from '../constants/whiteboardBackground';
import {
  clampOpacityPercent,
  formatHslString,
  formatRgbString,
  hexToHsv,
  hsvToHex,
  normalizeHex,
  parseColorInput,
  resolveCanvasBackgroundColor,
} from '../utils/whiteboardColorUtils';

const RECENT_COLORS_KEY = 'esca-whiteboard-recent-colors';
const MAX_RECENT = 16;

interface WhiteboardFreeColorPickerProps {
  color: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
}

function readRecentColors(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_COLORS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((c) => normalizeHex(String(c)))
      .filter((c): c is string => Boolean(c))
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function pushRecentColor(hex: string): void {
  const normalized = normalizeHex(hex);
  if (!normalized) return;
  const next = [normalized, ...readRecentColors().filter((c) => c !== normalized)].slice(
    0,
    MAX_RECENT,
  );
  try {
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function hueFromPointer(clientX: number, clientY: number, rect: DOMRect): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const angle = Math.atan2(clientY - cy, clientX - cx);
  return Math.round(((angle * 180) / Math.PI + 360) % 360);
}

function svFromPointer(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): { s: number; v: number } {
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  return { s: Math.round(x * 100), v: Math.round((1 - y) * 100) };
}

const WhiteboardFreeColorPicker: FunctionComponent<WhiteboardFreeColorPickerProps> = ({
  color,
  opacity,
  onChange,
}) => {
  const { t } = useTranslation();
  const initial = useMemo(() => hexToHsv(color) ?? { h: 220, s: 40, v: 15 }, [color]);
  const [hue, setHue] = useState(initial.h);
  const [sat, setSat] = useState(initial.s);
  const [val, setVal] = useState(initial.v);
  const [alpha, setAlpha] = useState(clampOpacityPercent(opacity));
  const [hexInput, setHexInput] = useState(color);
  const [rgbInput, setRgbInput] = useState(formatRgbString(color));
  const [hslInput, setHslInput] = useState(formatHslString(color));
  const [recent, setRecent] = useState<string[]>(() => readRecentColors());

  const hueRingRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<'hue' | 'sv' | 'value' | 'opacity' | null>(null);

  const previewColor = useMemo(
    () => resolveCanvasBackgroundColor(hsvToHex(hue, sat, val), alpha),
    [hue, sat, val, alpha],
  );

  const emit = useCallback(
    (h: number, s: number, v: number, a: number) => {
      const hex = hsvToHex(h, s, v);
      setHexInput(hex);
      setRgbInput(formatRgbString(hex));
      setHslInput(formatHslString(hex));
      onChange(hex, a);
      pushRecentColor(hex);
      setRecent(readRecentColors());
    },
    [onChange],
  );

  useEffect(() => {
    const hsv = hexToHsv(color);
    if (!hsv) return;
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
    setAlpha(clampOpacityPercent(opacity));
    setHexInput(color);
    setRgbInput(formatRgbString(color));
    setHslInput(formatHslString(color));
  }, [color, opacity]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const mode = dragRef.current;
      if (!mode) return;
      if (mode === 'hue' && hueRingRef.current) {
        const h = hueFromPointer(e.clientX, e.clientY, hueRingRef.current.getBoundingClientRect());
        setHue(h);
        emit(h, sat, val, alpha);
      }
      if (mode === 'sv' && svRef.current) {
        const next = svFromPointer(e.clientX, e.clientY, svRef.current.getBoundingClientRect());
        setSat(next.s);
        setVal(next.v);
        emit(hue, next.s, next.v, alpha);
      }
      if (mode === 'value') {
        const bar = document.getElementById('wb-color-value-track');
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const v = Math.round(t * 100);
        setVal(v);
        emit(hue, sat, v, alpha);
      }
      if (mode === 'opacity') {
        const bar = document.getElementById('wb-color-opacity-track');
        if (!bar) return;
        const rect = bar.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const a = Math.round(t * 100);
        setAlpha(a);
        emit(hue, sat, val, a);
      }
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [alpha, emit, hue, sat, val]);

  const applyHexFields = (raw: string) => {
    const hex = parseColorInput(raw) ?? normalizeHex(raw);
    if (!hex) return;
    const hsv = hexToHsv(hex);
    if (!hsv) return;
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
    emit(hsv.h, hsv.s, hsv.v, alpha);
  };

  const pickEyedropper = async () => {
    type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };
    const ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
    if (!ctor) return;
    try {
      const result = await new ctor().open();
      applyHexFields(result.sRGBHex);
    } catch {
      /* user cancelled */
    }
  };

  const valueGradient = `linear-gradient(to right, #fff, ${hsvToHex(hue, sat, 100)}, #000)`;
  const svBackground = `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${hsvToHex(hue, 100, 50)})`;

  return (
    <div className="student-wb-free-color-picker">
      <div className="student-wb-free-color-picker__wheel-wrap">
        <div
          ref={hueRingRef}
          className="student-wb-free-color-picker__hue-ring"
          role="slider"
          aria-label={t('student.encadrant.workspace.whiteboardPage.settings.background.colorPicker.hue')}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={hue}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragRef.current = 'hue';
            const h = hueFromPointer(
              e.clientX,
              e.clientY,
              e.currentTarget.getBoundingClientRect(),
            );
            setHue(h);
            emit(h, sat, val, alpha);
          }}
        >
          <div
            ref={svRef}
            className="student-wb-free-color-picker__sv"
            style={{ background: svBackground }}
            role="slider"
            aria-label={t(
              'student.encadrant.workspace.whiteboardPage.settings.background.colorPicker.saturation',
            )}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              dragRef.current = 'sv';
              const next = svFromPointer(
                e.clientX,
                e.clientY,
                e.currentTarget.getBoundingClientRect(),
              );
              setSat(next.s);
              setVal(next.v);
              emit(hue, next.s, next.v, alpha);
            }}
          >
            <span
              className="student-wb-free-color-picker__cursor"
              style={{ left: `${sat}%`, top: `${100 - val}%` }}
              aria-hidden
            />
          </div>
          <span
            className="student-wb-free-color-picker__hue-cursor"
            style={{ transform: `rotate(${hue}deg) translateY(-76px)` }}
            aria-hidden
          />
        </div>
      </div>

      <div className="student-wb-free-color-picker__slider-block">
        <span className="student-wb-free-color-picker__slider-label">
          {t('student.encadrant.workspace.whiteboardPage.settings.background.colorPicker.brightness')}
        </span>
        <div
          id="wb-color-value-track"
          className="student-wb-free-color-picker__track"
          style={{ background: valueGradient }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragRef.current = 'value';
            const rect = e.currentTarget.getBoundingClientRect();
            const v = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100);
            setVal(v);
            emit(hue, sat, v, alpha);
          }}
        >
          <span
            className="student-wb-free-color-picker__thumb"
            style={{ left: `${val}%` }}
            aria-hidden
          />
        </div>
      </div>

      <div className="student-wb-free-color-picker__slider-block">
        <span className="student-wb-free-color-picker__slider-label">
          {t('student.encadrant.workspace.whiteboardPage.settings.background.colorPicker.opacity')}
        </span>
        <div className="student-wb-free-color-picker__opacity-row">
          <div
            id="wb-color-opacity-track"
            className="student-wb-free-color-picker__track student-wb-free-color-picker__track--opacity"
            style={{
              background: `linear-gradient(to right, transparent, ${hsvToHex(hue, sat, val)}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 10px 10px`,
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragRef.current = 'opacity';
              const rect = e.currentTarget.getBoundingClientRect();
              const a = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100);
              setAlpha(a);
              emit(hue, sat, val, a);
            }}
          >
            <span
              className="student-wb-free-color-picker__thumb"
              style={{ left: `${alpha}%` }}
              aria-hidden
            />
          </div>
          <input
            type="text"
            className="student-wb-free-color-picker__opacity-input"
            value={`${alpha}%`}
            onChange={(e) => {
              const num = Number.parseInt(e.target.value.replace('%', ''), 10);
              if (Number.isNaN(num)) return;
              const a = clampOpacityPercent(num);
              setAlpha(a);
              emit(hue, sat, val, a);
            }}
            aria-label={t(
              'student.encadrant.workspace.whiteboardPage.settings.background.colorPicker.opacity',
            )}
          />
        </div>
      </div>

      <div className="student-wb-free-color-picker__footer">
        <div
          className="student-wb-free-color-picker__preview"
          style={{ background: previewColor }}
          title={previewColor}
          aria-hidden
        />
        <button
          type="button"
          className="student-wb-free-color-picker__tool-btn"
          onClick={() => void pickEyedropper()}
          title={t(
            'student.encadrant.workspace.whiteboardPage.settings.background.colorPicker.eyedropper',
          )}
          aria-label={t(
            'student.encadrant.workspace.whiteboardPage.settings.background.colorPicker.eyedropper',
          )}
        >
          <Pipette className="h-5 w-5" aria-hidden />
        </button>
        <div className="student-wb-free-color-picker__swatches" role="list">
          {[...recent, ...BACKGROUND_PRESETS.map((p) => p.hex)]
            .filter((hex, i, arr) => arr.indexOf(hex) === i)
            .slice(0, MAX_RECENT)
            .map((hex) => (
              <button
                key={hex}
                type="button"
                role="listitem"
                className={`student-wb-free-color-picker__swatch ${
                  normalizeHex(color) === hex ? 'is-active' : ''
                }`}
                style={{ background: hex }}
                title={hex}
                aria-label={hex}
                onClick={() => applyHexFields(hex)}
              />
            ))}
        </div>
      </div>

      <div className="student-wb-free-color-picker__fields">
        <label>
          <Droplet className="h-3.5 w-3.5" aria-hidden />
          <span>HEX</span>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={() => applyHexFields(hexInput)}
            onKeyDown={(e) => e.key === 'Enter' && applyHexFields(hexInput)}
            spellCheck={false}
          />
        </label>
        <label>
          <span>RGB</span>
          <input
            type="text"
            value={rgbInput}
            onChange={(e) => setRgbInput(e.target.value)}
            onBlur={() => applyHexFields(rgbInput)}
            onKeyDown={(e) => e.key === 'Enter' && applyHexFields(rgbInput)}
            spellCheck={false}
          />
        </label>
        <label>
          <span>HSL</span>
          <input
            type="text"
            value={hslInput}
            onChange={(e) => setHslInput(e.target.value)}
            onBlur={() => applyHexFields(hslInput)}
            onKeyDown={(e) => e.key === 'Enter' && applyHexFields(hslInput)}
            spellCheck={false}
          />
        </label>
      </div>
    </div>
  );
};

export default WhiteboardFreeColorPicker;
