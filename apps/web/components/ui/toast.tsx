"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
};

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...item, id }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-20 right-4 z-[80] flex w-[min(100%,22rem)] flex-col gap-2 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto rounded-xl border px-4 py-3 shadow-nw-elevated",
              t.variant === "success" && "border-nw-success/30 bg-nw-success/10 text-emerald-950",
              t.variant === "destructive" && "border-nw-danger/30 bg-nw-danger/10 text-red-950",
              (!t.variant || t.variant === "default") && "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description ? <p className="mt-0.5 text-xs opacity-90">{t.description}</p> : null}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} className="nw-touch-target rounded-md text-slate-500" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
