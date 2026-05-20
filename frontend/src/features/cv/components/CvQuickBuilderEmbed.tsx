import { FunctionComponent, useEffect, useRef } from 'react';
import { mountQuickCv, unmountQuickCv } from '../quickcv/mountQuickCv';

interface CvQuickBuilderEmbedProps {
  className?: string;
}

/**
 * QuickCV (Svelte) monté dans le même bundle Vite que React — un seul `npm run dev`.
 */
export const CvQuickBuilderEmbed: FunctionComponent<CvQuickBuilderEmbedProps> = ({
  className = '',
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ReturnType<typeof mountQuickCv> | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    handleRef.current = mountQuickCv(host);

    return () => {
      if (handleRef.current) {
        unmountQuickCv(handleRef.current);
        handleRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`quickcv-host relative isolate min-h-0 w-full overflow-hidden ${className}`}
    />
  );
};

export default CvQuickBuilderEmbed;
