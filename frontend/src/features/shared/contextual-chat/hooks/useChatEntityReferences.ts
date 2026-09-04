import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchChatEntityReferences } from '../api/chatApi';
import type { ChatModule } from '../types';
import type { ChatEntityReference } from '../types/chatEntityTypes';

const cache = new Map<string, ChatEntityReference[]>();

function cacheKey(module: ChatModule, conversationId?: string, q?: string) {
  return `${module}:${conversationId ?? 'none'}:${q ?? ''}`;
}

export function clearChatEntityReferencesCache() {
  cache.clear();
}

export function useChatEntityReferences(
  chatModule: ChatModule,
  conversationId?: string,
  enabled = true,
) {
  const [items, setItems] = useState<ChatEntityReference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const requestId = useRef(0);

  const load = useCallback(
    async (query?: string) => {
      if (!enabled) return;
      const key = cacheKey(chatModule, conversationId, query);
      const cached = cache.get(key);
      if (cached && !query) {
        setItems(cached);
        setError(null);
        return;
      }

      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const next = await fetchChatEntityReferences(chatModule, {
          conversationId: conversationId ? Number(conversationId) : undefined,
          q: query,
        });
        if (id !== requestId.current) return;
        if (!query) cache.set(key, next);
        setItems(next);
      } catch {
        if (id !== requestId.current) return;
        setError('load_failed');
        setItems([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [chatModule, conversationId, enabled],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(search.trim() || undefined);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  return {
    items,
    loading,
    error,
    search,
    setSearch,
    reload: () => void load(search.trim() || undefined),
  };
}
