import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchChatTags } from '../api/chatApi';
import type { ChatModule } from '../types';
import type { ChatTagOption } from '../types/chatTagTypes';

const cacheByModule = new Map<string, ChatTagOption[]>();
const inflightByModule = new Map<string, Promise<ChatTagOption[]>>();

function mapTags(tags: Awaited<ReturnType<typeof fetchChatTags>>): ChatTagOption[] {
  return tags.map((tag) => ({
    code: tag.code,
    name: tag.name,
    color: tag.color || '#64748b',
    is_system: Boolean(tag.is_system),
  }));
}

async function loadChatTagsForModule(module: ChatModule): Promise<ChatTagOption[]> {
  const cached = cacheByModule.get(module);
  if (cached) return cached;

  let inflight = inflightByModule.get(module);
  if (!inflight) {
    inflight = fetchChatTags(module)
      .then((tags) => {
        const mapped = mapTags(tags);
        cacheByModule.set(module, mapped);
        return mapped;
      })
      .finally(() => {
        inflightByModule.delete(module);
      });
    inflightByModule.set(module, inflight);
  }
  return inflight;
}

export function clearChatTagsCache(module?: ChatModule): void {
  if (module) {
    cacheByModule.delete(module);
    inflightByModule.delete(module);
    return;
  }
  cacheByModule.clear();
  inflightByModule.clear();
}

export function useAuthorizedChatTags(module: ChatModule | undefined, enabled = true) {
  const [tags, setTags] = useState<ChatTagOption[]>(() =>
    module ? cacheByModule.get(module) ?? [] : [],
  );
  const [loading, setLoading] = useState(Boolean(enabled && module && !cacheByModule.has(module)));
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled || !module) return;
    setLoading(true);
    setError(null);
    try {
      clearChatTagsCache(module);
      const next = await loadChatTagsForModule(module);
      if (mountedRef.current) setTags(next);
    } catch {
      if (mountedRef.current) {
        setError('tags_load_failed');
        setTags([]);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled, module]);

  useEffect(() => {
    if (!enabled || !module) {
      setTags([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(!cacheByModule.has(module));
    setError(null);

    void loadChatTagsForModule(module)
      .then((next) => {
        if (!cancelled) setTags(next);
      })
      .catch(() => {
        if (!cancelled) {
          setError('tags_load_failed');
          setTags([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, module]);

  const byCode = useMemo(() => {
    const map = new Map<string, ChatTagOption>();
    for (const tag of tags) map.set(tag.code, tag);
    return map;
  }, [tags]);

  return { tags, byCode, loading, error, refresh };
}
