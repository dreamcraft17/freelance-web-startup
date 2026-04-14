import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Scroll container for wide admin tables. */
export function AdminTableScroll({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
}

export function AdminTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <table className={cn("w-full min-w-[42rem] border-collapse text-left text-sm", className)}>{children}</table>
  );
}

export function AdminThead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </thead>
  );
}

export function AdminTbody({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tbody className={cn("divide-y divide-slate-100", className)}>{children}</tbody>;
}

export function AdminTr({
  children,
  className,
  variant = "body"
}: {
  children: ReactNode;
  className?: string;
  /** Header rows inherit thead background; body rows use white for zebra-free rows. */
  variant?: "head" | "body";
}) {
  return <tr className={cn(variant === "body" && "bg-white", className)}>{children}</tr>;
}

export function AdminTh({
  children,
  className,
  scope = "col"
}: {
  children: ReactNode;
  className?: string;
  scope?: "col" | "row";
}) {
  return (
    <th scope={scope} className={cn("whitespace-nowrap px-3 py-2.5 font-medium first:pl-3.5", className)}>
      {children}
    </th>
  );
}

export function AdminTd({
  children,
  className,
  title
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={cn("px-3 py-2 align-middle first:pl-3.5", className)} title={title}>
      {children}
    </td>
  );
}

/** Monospace cell for IDs / external keys. */
export function AdminIdCell({ id }: { id: string }) {
  const short = id.length > 14 ? `${id.slice(0, 10)}…` : id;
  return (
    <AdminTd className="max-w-[8rem] font-mono text-[11px] text-slate-700" title={id}>
      {short}
    </AdminTd>
  );
}
