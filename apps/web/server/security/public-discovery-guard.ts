import { createHash } from "node:crypto";
import type { NextResponse } from "next/server";
import { consumeRateLimitOr429 } from "./consume-rate-limit";
import {
  publicDiscoveryEnumerationLimiter,
  publicDiscoveryIpLimiter,
  suspiciousPublicDiscoveryLimiter
} from "./limiters";

/** Sliding window for discovery IP bucket */
const DISCOVERY_WINDOW_MS = 60_000;

/** Human browsing + light automation; separate from auth and from generic `pub:` reads */
const DISCOVERY_IP_MAX_DEFAULT = 78;

/** Major search / preview crawlers: higher ceiling, no suspicious-UA penalty */
const DISCOVERY_IP_MAX_INDEXER = 220;

/** Requests per window sharing the same non-page query fingerprint */
const DISCOVERY_ENUM_MAX_DEFAULT = 22;
const DISCOVERY_ENUM_MAX_INDEXER = 90;

/** Tighter cap when UA / pattern signals scripted access */
const SUSPICIOUS_DISCOVERY_MAX = 34;

const INDEXER_UA =
  /googlebot|bingbot|applebot|duckduckbot|yandexbot|baiduspider|facebot|facebookexternalhit|linkedinbot|twitterbot|slackbot|discordbot|ia_archiver|slurp|embedly|pinterest|vkshare|quora link preview/i;

/** Script-like or empty UA (indexers excluded). Kept conservative to limit false positives. */
const SCRIPTED_UA =
  /\b(curl|wget|python-requests|aiohttp|axios\/|libwww|go-http-client|httpclient|java\/|scrapy|httpunit|phantomjs|headless|selenium|puppeteer|playwright)\b/i;

function isLikelyIndexerOrPreviewBot(userAgent: string): boolean {
  return INDEXER_UA.test(userAgent);
}

/**
 * Internal-only scrape signal (0 = neutral). Not exposed to clients.
 * Indexer/preview bots always score 0.
 */
export function scoreDiscoveryRequest(request: Request): number {
  const ua = request.headers.get("user-agent") ?? "";
  if (isLikelyIndexerOrPreviewBot(ua)) return 0;
  let score = 0;
  const trimmed = ua.trim();
  if (trimmed.length === 0) score += 1;
  if (SCRIPTED_UA.test(ua)) score += 2;
  else if (trimmed.length > 0 && trimmed.length < 16 && !/mozilla\/5\.0/i.test(ua)) score += 1;
  return Math.min(4, score);
}

/** Stable fingerprint of list/search intent; `page` omitted so paging shares one bucket */
export function buildDiscoveryFingerprint(url: URL): string {
  const params = new URLSearchParams(url.search);
  params.delete("page");
  const pairs = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  return pairs.map(([k, v]) => `${k}=${v}`).join("&");
}

function fingerprintKey(ip: string, fingerprint: string): string {
  const h = createHash("sha256").update(fingerprint).digest("hex").slice(0, 20);
  return `enum:${ip}:${h}`;
}

/**
 * Safe, coarse-grained log line — no scoring rules in API responses; avoid PII in messages.
 * Disable with NEARWORK_DISCOVERY_LOG=0.
 */
export function logDiscoverySignal(event: string, meta: Record<string, unknown>): void {
  if (process.env.NEARWORK_DISCOVERY_LOG === "0") return;
  console.warn(`[nearwork:discovery] ${event}`, { ...meta, ts: Date.now() });
}

/**
 * Reserved for Turnstile / hCaptcha / edge WAF escalation.
 * No-op unless product later sets NEARWORK_DISCOVERY_CHALLENGE and implements the handshake.
 */
export function noteDiscoveryEscalation(reason: "risk_score" | "enum_pressure", detail?: string): void {
  if (process.env.NEARWORK_DISCOVERY_CHALLENGE === "1" && process.env.NODE_ENV !== "test") {
    logDiscoverySignal("challenge_hook", { reason, detail: detail ? "set" : "none" });
  }
}

/**
 * Rate limits and light heuristics for public discovery list/search APIs.
 * @returns 429 NextResponse when limited; otherwise null.
 */
export function consumePublicDiscoveryLimits(request: Request, ip: string, url: URL): NextResponse | null {
  const ua = request.headers.get("user-agent") ?? "";
  const indexer = isLikelyIndexerOrPreviewBot(ua);
  const ipMax = indexer ? DISCOVERY_IP_MAX_INDEXER : DISCOVERY_IP_MAX_DEFAULT;
  const enumMax = indexer ? DISCOVERY_ENUM_MAX_INDEXER : DISCOVERY_ENUM_MAX_DEFAULT;

  const ipLimited = consumeRateLimitOr429(
    publicDiscoveryIpLimiter,
    `disc:${ip}`,
    ipMax,
    DISCOVERY_WINDOW_MS,
    "Too many discovery requests. Please try again shortly."
  );
  if (ipLimited) return ipLimited;

  const fp = buildDiscoveryFingerprint(url);
  const enumLimited = consumeRateLimitOr429(
    publicDiscoveryEnumerationLimiter,
    fingerprintKey(ip, fp),
    enumMax,
    DISCOVERY_WINDOW_MS,
    "Too many requests for this search. Please slow down."
  );
  if (enumLimited) {
    logDiscoverySignal("enum_limit", { indexer });
    noteDiscoveryEscalation("enum_pressure");
    return enumLimited;
  }

  if (!indexer) {
    const risk = scoreDiscoveryRequest(request);
    if (risk >= 2) {
      const susp = consumeRateLimitOr429(
        suspiciousPublicDiscoveryLimiter,
        `susp:${ip}`,
        SUSPICIOUS_DISCOVERY_MAX,
        DISCOVERY_WINDOW_MS,
        "Too many requests. Please try again later."
      );
      if (susp) {
        logDiscoverySignal("suspicious_client_limit", {});
        noteDiscoveryEscalation("risk_score");
        return susp;
      }
    }
    if (risk >= 3) {
      logDiscoverySignal("elevated_risk", {});
    }
  }

  return null;
}
