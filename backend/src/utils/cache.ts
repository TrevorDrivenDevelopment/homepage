/**
 * Simple in-memory TTL cache for Lambda warm instances.
 * Survives across invocations on the same warm Lambda container,
 * reducing redundant Alpha Vantage API calls.
 *
 * CONCURRENCY NOTE: This is a per-container singleton (see `cache` export below).
 * Under concurrent Lambda invocations, multiple warm containers each maintain their
 * own independent cache, and cold starts get an empty cache. This means cache hits
 * are best-effort, not a global guarantee — fine for this project's scale, but if
 * strict cross-container consistency is ever needed, swap this for a shared store
 * (e.g. DynamoDB, ElastiCache/Redis).
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Get a cached value if it exists and hasn't expired.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Store a value with a TTL in milliseconds.
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Check if a non-expired entry exists.
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove a specific entry.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Remove all expired entries (housekeeping).
   */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get cache stats for logging.
   */
  stats(): { size: number; keys: string[] } {
    this.prune();
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Singleton cache instance — persists across warm Lambda invocations
export const cache = new MemoryCache();
