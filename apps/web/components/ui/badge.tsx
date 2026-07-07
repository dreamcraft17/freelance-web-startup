import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        brand: "border-nw-brand/25 bg-nw-brand/10 text-nw-brand",
        success: "border-nw-success/25 bg-nw-success/10 text-emerald-900 dark:text-emerald-200",
        warning: "border-nw-warning/25 bg-nw-warning/10 text-amber-900 dark:text-amber-200",
        destructive: "border-nw-danger/25 bg-nw-danger/10 text-red-900 dark:text-red-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
