"use client";

import { NW_CSRF_COOKIE_NAME, NW_CSRF_HEADER_NAME } from "@src/lib/csrf-constants";

function readCsrfFromDocumentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    if (name !== NW_CSRF_COOKIE_NAME) continue;
    const raw = part.slice(idx + 1).trim();
    try {
      const v = decodeURIComponent(raw);
      return v.length ? v : null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Ensures a CSRF cookie exists (session must already be valid). Call before mutating APIs
 * when the cookie might be missing (e.g. older sessions).
 */
export async function ensureCsrfCookie(): Promise<string | null> {
  const existing = readCsrfFromDocumentCookie();
  if (existing) return existing;
  const res = await fetch("/api/auth/csrf", { method: "GET", credentials: "same-origin" });
  if (!res.ok) return null;
  return readCsrfFromDocumentCookie();
}

/**
 * Same-origin `fetch` with `X-CSRF-Token` for cookie-authenticated mutations.
 */
export async function fetchWithCsrf(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers ?? undefined);
  const token = await ensureCsrfCookie();
  if (token) {
    headers.set(NW_CSRF_HEADER_NAME, token);
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "same-origin"
  });
}
