import { type RefObject, useEffect } from 'react';

const SCROLL_EPSILON = 2;

function normalizeWheelDelta(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }
  return event.deltaY;
}

function getScrollableAncestors(start: HTMLElement | null): HTMLElement[] {
  const ancestors: HTMLElement[] = [];
  let node = start?.parentElement ?? null;

  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      ancestors.push(node);
    }
    node = node.parentElement;
  }

  const root = (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
  if (!ancestors.includes(root)) {
    ancestors.push(root);
  }

  return ancestors;
}

function canScrollVertically(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight + SCROLL_EPSILON;
}

function isAtScrollTop(element: HTMLElement) {
  return element.scrollTop <= SCROLL_EPSILON;
}

function isAtScrollBottom(element: HTMLElement) {
  return element.scrollTop + element.clientHeight >= element.scrollHeight - SCROLL_EPSILON;
}

function scrollElementBy(element: HTMLElement, deltaY: number) {
  const before = element.scrollTop;
  element.scrollTop += deltaY;
  return element.scrollTop - before;
}

function propagateWheelToPage(anchor: HTMLElement | null, deltaY: number) {
  if (deltaY === 0) return;

  let remaining = deltaY;
  for (const scroller of getScrollableAncestors(anchor)) {
    if (Math.abs(remaining) < SCROLL_EPSILON) break;
    if (!canScrollVertically(scroller)) continue;

    const scrollingUp = remaining < 0;
    const scrollingDown = remaining > 0;
    if (scrollingUp && isAtScrollTop(scroller)) continue;
    if (scrollingDown && isAtScrollBottom(scroller)) continue;

    remaining -= scrollElementBy(scroller, remaining);
  }
}

function handleDropdownWheel(
  event: WheelEvent,
  menu: HTMLElement,
  optionsEl: HTMLElement | null,
  anchor: HTMLElement | null,
) {
  const deltaY = normalizeWheelDelta(event);
  if (deltaY === 0) return;

  const target = event.target as Node;
  const wheelOverOptions = Boolean(optionsEl?.contains(target));

  if (wheelOverOptions && optionsEl && canScrollVertically(optionsEl)) {
    const scrollingUp = deltaY < 0;
    const scrollingDown = deltaY > 0;
    const atTop = isAtScrollTop(optionsEl);
    const atBottom = isAtScrollBottom(optionsEl);

    if ((scrollingUp && !atTop) || (scrollingDown && !atBottom)) {
      event.preventDefault();
      event.stopPropagation();
      scrollElementBy(optionsEl, deltaY);
      return;
    }

    if ((scrollingUp && atTop) || (scrollingDown && atBottom)) {
      event.preventDefault();
      event.stopPropagation();
      propagateWheelToPage(anchor, deltaY);
      return;
    }
  }

  event.preventDefault();
  event.stopPropagation();
  propagateWheelToPage(anchor, deltaY);
}

/**
 * SaaS-style scroll chaining for portaled admin dropdowns.
 * Enabled only once the menu portal is mounted (e.g. when positioning coords exist).
 */
export function useAdminDropdownScrollChain(
  enabled: boolean,
  menuRef: RefObject<HTMLElement | null>,
  optionsRef: RefObject<HTMLElement | null>,
  anchorRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!enabled) return;

    const onWheel = (event: WheelEvent) => {
      const menu = menuRef.current;
      if (!menu?.contains(event.target as Node)) return;
      handleDropdownWheel(event, menu, optionsRef.current, anchorRef.current);
    };

    document.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => document.removeEventListener('wheel', onWheel, { capture: true });
  }, [enabled, menuRef, optionsRef, anchorRef]);
}
