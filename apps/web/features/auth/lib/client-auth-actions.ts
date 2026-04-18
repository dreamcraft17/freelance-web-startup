"use client";

/**
 * Shared client-side auth actions for UI components.
 * Keeps logout/session checks consistent across menus, buttons, and CTA guards.
 */
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
export async function hasActiveSession(): Promise<boolean> {
  const snapshot = await getSessionSnapshot();
  return snapshot.ok;
}

export async function getSessionSnapshot(): Promise<{ ok: boolean; data?: { userId: string; role: string; accountStatus: string } }> {
  try {
    const res = await fetch("/api/auth/session", { method: "GET", credentials: "same-origin" });
    if (!res.ok) return { ok: false };
    const json = (await res.json()) as {
      success?: boolean;
      data?: { userId: string; role: string; accountStatus: string };
    };
    return json.success && json.data ? { ok: true, data: json.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function signOutCurrentSession(): Promise<{ ok: boolean }> {
  try {
    const res = await fetchWithCsrf("/api/auth/logout", { method: "POST" });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

