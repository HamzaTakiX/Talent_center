import { useCallback, useEffect, useId, useState } from 'react';

type Listener = (activeId: string | null) => void;

let activeDropdownId: string | null = null;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyActive(activeId: string | null) {
  activeDropdownId = activeId;
  listeners.forEach((listener) => listener(activeId));
}

/** Ensures only one admin portal dropdown is open at a time across the page. */
export function useAdminDropdownOpenState(instanceId?: string) {
  const autoId = useId();
  const id = instanceId ?? autoId;
  const [open, setOpenState] = useState(false);

  useEffect(() => {
    return subscribe((activeId) => {
      if (activeId !== id) {
        setOpenState(false);
      }
    });
  }, [id]);

  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setOpenState((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        if (resolved) {
          notifyActive(id);
        } else if (activeDropdownId === id) {
          notifyActive(null);
        }
        return resolved;
      });
    },
    [id],
  );

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return { open, setOpen, close };
}
