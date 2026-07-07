"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used within Dialog");
  return ctx;
}

export function Dialog({
  open: controlledOpen,
  onOpenChange,
  children
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = onOpenChange ?? setUncontrolled;

  React.useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, [open]);

  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({
  children,
  asChild
}: {
  children: React.ReactElement;
  asChild?: boolean;
}) {
  const { setOpen } = useDialog();
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(true)
    });
  }
  return (
    <button type="button" onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function DialogContent({
  children,
  className,
  title,
  description
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  const { open, setOpen } = useDialog();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60"
        aria-label="Close dialog"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby={description ? "dialog-desc" : undefined}
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-nw-elevated sm:rounded-2xl dark:border-slate-700 dark:bg-slate-900",
          className
        )}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-5">
          <div className="min-w-0 pr-2">
            {title ? (
              <h2 id="dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id="dialog-desc" className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setOpen(false)} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
      </div>
    </div>
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-end dark:border-slate-700 sm:px-5", className)} {...props} />;
}
