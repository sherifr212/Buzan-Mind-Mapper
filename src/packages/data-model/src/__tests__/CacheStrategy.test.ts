/**
 * AT-PWA-049 — CacheStrategy unit tests (6 cases)
 * Tests the logic of SW cache strategies as pure functions.
 * - CacheFirst: returns cache hit without network call
 * - CacheFirst: falls back to network on cache miss
 * - NetworkFirst: returns network response and updates cache
 * - NetworkFirst: returns cache on network failure
 * - StaleWhileRevalidate: returns cache immediately and triggers revalidation
 * - Cache eviction removes oldest entry when limit is reached
 */

import { describe, it, expect, vi } from 'vitest';

// ─── Pure cache strategy implementations (mirroring SW logic) ────────────────

interface CacheEntry {
  url: string;
  response: string;
  timestamp: number;
}

class MockCacheStore {
  private entries: Map<string, CacheEntry> = new Map();

  async match(url: string): Promise<string | null> {
    return this.entries.get(url)?.response ?? null;
  }

  async put(url: string, response: string): Promise<void> {
    this.entries.set(url, { url, response, timestamp: Date.now() });
  }

  async delete(url: string): Promise<void> {
    this.entries.delete(url);
  }

  size(): number {
    return this.entries.size;
  }

  oldest(): string | null {
    let oldest: CacheEntry | null = null;
    for (const entry of this.entries.values()) {
      if (!oldest || entry.timestamp < oldest.timestamp) oldest = entry;
    }
    return oldest?.url ?? null;
  }
}

async function cacheFirst(
  url: string,
  cache: MockCacheStore,
  fetcher: (url: string) => Promise<string>,
): Promise<string> {
  const cached = await cache.match(url);
  if (cached !== null) return cached;
  const fresh = await fetcher(url);
  await cache.put(url, fresh);
  return fresh;
}

async function networkFirst(
  url: string,
  cache: MockCacheStore,
  fetcher: (url: string) => Promise<string>,
): Promise<string> {
  try {
    const fresh = await fetcher(url);
    await cache.put(url, fresh);
    return fresh;
  } catch {
    const cached = await cache.match(url);
    if (cached !== null) return cached;
    throw new Error('No cache and network failed');
  }
}

async function staleWhileRevalidate(
  url: string,
  cache: MockCacheStore,
  fetcher: (url: string) => Promise<string>,
  onRevalidated: (fresh: string) => void,
): Promise<string> {
  const cached = await cache.match(url);
  // Always trigger background revalidation
  void fetcher(url).then(async (fresh) => {
    await cache.put(url, fresh);
    onRevalidated(fresh);
  });
  if (cached !== null) return cached;
  // Cache miss: wait for network
  return fetcher(url);
}

async function evictOldestIfNeeded(
  cache: MockCacheStore,
  maxEntries: number,
): Promise<void> {
  if (cache.size() > maxEntries) {
    const oldest = cache.oldest();
    if (oldest) await cache.delete(oldest);
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AT-PWA-049 CacheStrategy', () => {
  it('case 1: CacheFirst returns cache hit without network call', async () => {
    const cache = new MockCacheStore();
    await cache.put('/api/maps', 'cached-response');
    const fetcher = vi.fn().mockResolvedValue('network-response');

    const result = await cacheFirst('/api/maps', cache, fetcher);

    expect(result).toBe('cached-response');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('case 2: CacheFirst falls back to network on cache miss', async () => {
    const cache = new MockCacheStore();
    const fetcher = vi.fn().mockResolvedValue('network-response');

    const result = await cacheFirst('/api/maps', cache, fetcher);

    expect(result).toBe('network-response');
    expect(fetcher).toHaveBeenCalledOnce();
    // Also caches the response
    expect(await cache.match('/api/maps')).toBe('network-response');
  });

  it('case 3: NetworkFirst returns network response and updates cache', async () => {
    const cache = new MockCacheStore();
    await cache.put('/api/maps', 'stale-cached');
    const fetcher = vi.fn().mockResolvedValue('fresh-response');

    const result = await networkFirst('/api/maps', cache, fetcher);

    expect(result).toBe('fresh-response');
    expect(await cache.match('/api/maps')).toBe('fresh-response');
  });

  it('case 4: NetworkFirst returns cache on network failure', async () => {
    const cache = new MockCacheStore();
    await cache.put('/api/maps', 'cached-fallback');
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));

    const result = await networkFirst('/api/maps', cache, fetcher);

    expect(result).toBe('cached-fallback');
  });

  it('case 5: StaleWhileRevalidate returns cache immediately and triggers background revalidation', async () => {
    const cache = new MockCacheStore();
    await cache.put('/api/maps', 'stale-response');
    const fetcher = vi.fn().mockResolvedValue('fresh-response');
    const revalidated = vi.fn();

    const result = await staleWhileRevalidate('/api/maps', cache, fetcher, revalidated);

    // Returns stale immediately
    expect(result).toBe('stale-response');

    // Wait for background revalidation
    await new Promise((r) => setTimeout(r, 10));
    expect(revalidated).toHaveBeenCalledWith('fresh-response');
    expect(await cache.match('/api/maps')).toBe('fresh-response');
  });

  it('case 6: cache eviction removes oldest entry when limit is reached', async () => {
    const cache = new MockCacheStore();
    await cache.put('/api/map/1', 'map-1');
    await new Promise((r) => setTimeout(r, 2));
    await cache.put('/api/map/2', 'map-2');
    await new Promise((r) => setTimeout(r, 2));
    await cache.put('/api/map/3', 'map-3');

    // Limit is 2, evict oldest
    await evictOldestIfNeeded(cache, 2);

    expect(cache.size()).toBe(2);
    expect(await cache.match('/api/map/1')).toBeNull(); // oldest evicted
    expect(await cache.match('/api/map/2')).toBe('map-2');
    expect(await cache.match('/api/map/3')).toBe('map-3');
  });
});
