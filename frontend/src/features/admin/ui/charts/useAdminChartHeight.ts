import { useEffect, useState } from 'react';

const DESKTOP = 148;
const MOBILE = 124;

export function useAdminChartHeight(desktop = DESKTOP, mobile = MOBILE) {
  const [height, setHeight] = useState(desktop);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setHeight(mq.matches ? mobile : desktop);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [desktop, mobile]);

  return height;
}

export const CHART_WIDTH = 520;
export const CHART_PADDING = { top: 8, right: 8, bottom: 24, left: 34 } as const;
