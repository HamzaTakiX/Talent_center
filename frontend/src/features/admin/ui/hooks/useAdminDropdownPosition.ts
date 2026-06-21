import { type RefObject, useCallback, useLayoutEffect, useState } from 'react';

export interface AdminDropdownCoords {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
}

const MENU_GAP = 6;
const DEFAULT_MAX = 280;

export function useAdminDropdownPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>
): AdminDropdownCoords | null {
  const [coords, setCoords] = useState<AdminDropdownCoords | null>(null);

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? DEFAULT_MAX;
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const spaceAbove = rect.top - MENU_GAP;
    const minOpen = 120;
    const fitsBelow = spaceBelow >= minOpen;
    // Prefer opening downward; flip above only when there is clearly more room on top.
    const openBelow = fitsBelow || spaceBelow >= spaceAbove;
    const placement = openBelow ? 'bottom' : 'top';
    const maxHeight = Math.min(
      DEFAULT_MAX,
      Math.max(minOpen, openBelow ? spaceBelow - 4 : spaceAbove - 4),
    );

    const top = openBelow
      ? rect.bottom + MENU_GAP
      : Math.max(MENU_GAP, rect.top - Math.min(menuHeight, maxHeight) - MENU_GAP);

    setCoords({
      top,
      left: rect.left,
      width: rect.width,
      maxHeight,
      placement,
    });
  }, [triggerRef, menuRef]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, update]);

  return coords;
}
