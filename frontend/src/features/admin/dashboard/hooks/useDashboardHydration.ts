import { useEffect, useState } from 'react';

/** Brief hydration shimmer — swap for real API loading when wired */
export const useDashboardHydration = (delayMs = 480) => {
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setIsHydrating(false), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  return isHydrating;
};
