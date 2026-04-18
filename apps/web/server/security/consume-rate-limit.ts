import { jsonRateLimited } from "@/server/http/api-response";
import type { NextResponse } from "next/server";
import type { SlidingWindowRateLimiter } from "./sliding-window-limiter";

/**
 * @returns `NextResponse` with 429 when over limit; otherwise `null` (caller continues).
 */
export function consumeRateLimitOr429(
  limiter: SlidingWindowRateLimiter,
  key: string,
  max: number,
  windowMs: number,
  message = "Too many requests. Please try again later."
): NextResponse | null {
  const r = limiter.tryConsume(key, max, windowMs);
  if (!r.ok) {
    return jsonRateLimited(message, r.retryAfterSec);
  }
  return null;
}
