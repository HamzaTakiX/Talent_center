const meInflight = new Map<string, Promise<unknown>>();

/**
 * Deduplicate concurrent identical GET requests within the same page session.
 */
export async function dedupedGet<T>(cacheKey: string, request: () => Promise<T>): Promise<T> {
  const inflight = meInflight.get(cacheKey);
  if (inflight) {
    return inflight as Promise<T>;
  }
  const promise = request().finally(() => {
    meInflight.delete(cacheKey);
  });
  meInflight.set(cacheKey, promise);
  return promise;
}
