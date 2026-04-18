/**
 * In-memory sliding-window rate limiter. Keys are caller-defined (e.g. `ip:…`, `user:…`).
 * Swap implementation later for Redis without changing route call sites.
 */
export class SlidingWindowRateLimiter {
  private readonly hits = new Map<string, number[]>();

  tryConsume(key: string, max: number, windowMs: number): { ok: true } | { ok: false; retryAfterSec: number } {
    const now = Date.now();
    const cutoff = now - windowMs;
    let stamps = this.hits.get(key) ?? [];
    stamps = stamps.filter((t) => t > cutoff);

    if (stamps.length >= max) {
      const oldest = stamps[0]!;
      const retryAfterMs = Math.max(0, oldest + windowMs - now);
      this.hits.set(key, stamps);
      return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
    }

    stamps.push(now);
    this.hits.set(key, stamps);
    return { ok: true };
  }
}
