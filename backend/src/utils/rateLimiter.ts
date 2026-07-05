import { log } from './logger';

/**
 * Rate limiter to enforce Alpha Vantage's 1 request/second limit.
 * Uses a simple queue to serialize API calls with minimum spacing.
 *
 * CONCURRENCY NOTE: `lastCallTime` is per-container module state, just like
 * MemoryCache. It only serializes calls made within the same warm Lambda
 * container/process — concurrent containers can still exceed the 1 req/sec
 * limit in aggregate. This is acceptable for this project's low-traffic,
 * personal-scale usage, but would need a shared/distributed limiter
 * (e.g. token bucket in DynamoDB) for real concurrency guarantees.
 */

const MIN_INTERVAL_MS = 1200; // Slightly over 1 second to be safe

let lastCallTime = 0;

/**
 * Wait until it's safe to make the next Alpha Vantage API call,
 * then execute the provided function.
 * Ensures at least MIN_INTERVAL_MS between consecutive calls.
 */
export async function throttledCall<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  const waitTime = Math.max(0, MIN_INTERVAL_MS - elapsed);

  if (waitTime > 0) {
    log.debug('Rate limiter waiting before next API call', { waitTimeMs: waitTime });
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastCallTime = Date.now();
  return fn();
}

/**
 * Custom error class for rate limit responses from Alpha Vantage.
 * Allows the handler to distinguish rate limits from other errors.
 */
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
