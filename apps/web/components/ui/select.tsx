import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full min-h-11 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus-visible:border-nw-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nw-brand/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100",
      "bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat pr-9",
      className
    )}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      ...props.style
    }}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
