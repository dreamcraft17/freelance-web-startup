type Entry = { timestamps: number[]; lockedUntil?: number };

const FAIL_WINDOW_MS = 15 * 60 * 1000;
const FAIL_MAX = 8;
const LOCK_MS = 15 * 60 * 1000;

const byIpEmail = new Map<string, Entry>();

function pairKey(ip: string, emailNorm: string): string {
  return `${ip}::${emailNorm}`;
}

function prune(ts: number[], now: number): number[] {
  return ts.filter((t) => now - t < FAIL_WINDOW_MS);
}

export function getLoginAttemptState(
  ip: string,
  emailNorm: string
): { locked: false } | { locked: true; retryAfterSec: number } {
  const now = Date.now();
  const e = byIpEmail.get(pairKey(ip, emailNorm));
  if (e?.lockedUntil != null && e.lockedUntil > now) {
    return { locked: true, retryAfterSec: Math.max(1, Math.ceil((e.lockedUntil - now) / 1000)) };
  }
  return { locked: false };
}

export function recordFailedLogin(ip: string, emailNorm: string): void {
  const now = Date.now();
  const k = pairKey(ip, emailNorm);
  let e = byIpEmail.get(k) ?? { timestamps: [], lockedUntil: undefined };
  e.timestamps = prune(e.timestamps, now);
  e.timestamps.push(now);
  if (e.timestamps.length >= FAIL_MAX) {
    e.lockedUntil = now + LOCK_MS;
    e.timestamps = [];
  }
  byIpEmail.set(k, e);
}

export function clearFailedLogin(ip: string, emailNorm: string): void {
  byIpEmail.delete(pairKey(ip, emailNorm));
}
