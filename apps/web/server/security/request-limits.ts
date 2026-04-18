const DEFAULT_AUTH_MAX = 32_768;

/**
 * Rejects oversized bodies when `Content-Length` is present and trustworthy enough for abuse prevention.
 * When the header is missing, returns true (body still bounded by platform / parseJson).
 */
export function isContentLengthWithinLimit(request: Request, maxBytes = DEFAULT_AUTH_MAX): boolean {
  const raw = request.headers.get("content-length");
  if (raw == null) return true;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return true;
  return n <= maxBytes;
}
