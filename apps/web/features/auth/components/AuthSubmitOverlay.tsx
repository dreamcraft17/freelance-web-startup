"use client";

type AuthSubmitOverlayProps = {
  active: boolean;
  message: string;
};

/**
 * Reusable lightweight full-screen processing overlay for auth submits.
 */
export function AuthSubmitOverlay({ active, message }: AuthSubmitOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!active}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
        active ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#3525cd]" aria-hidden />
        <span className="text-sm font-semibold text-slate-700">{message}</span>
      </div>
    </div>
  );
}
