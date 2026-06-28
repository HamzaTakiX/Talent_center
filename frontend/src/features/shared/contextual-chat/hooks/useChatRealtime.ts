import { useEffect, useRef } from 'react';

/**
 * WebSocket-ready polling bridge until Django Channels is connected.
 * Replace pollFn with socket subscription when backend WS is live.
 */
export function useChatRealtime(
  conversationId: string | null,
  onRefresh: () => void,
  enabled = true,
  intervalMs = 12000
) {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!enabled || !conversationId) return undefined;

    const tick = () => {
      if (document.visibilityState === 'visible') {
        onRefreshRef.current();
      }
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [conversationId, enabled, intervalMs]);
}
