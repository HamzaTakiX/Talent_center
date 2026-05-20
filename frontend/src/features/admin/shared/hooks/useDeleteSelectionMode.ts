import { useCallback, useState } from 'react';

export function useDeleteSelectionMode() {
  const [selectionMode, setSelectionMode] = useState(false);

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
  }, []);

  return {
    selectionMode,
    enterSelectionMode,
    exitSelectionMode,
  };
}
