import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  href: string;
  label: string;
};

type DashboardShellProps = {
  navItems: DashboardNavItem[];
  children: ReactNode;
  /** Optional class on main content area */
  className?: string;
  /** Optional banner above page content (e.g. early access + quota hints). */
  topBanner?: ReactNode;
};

/**
 * Shared responsive shell for freelancer/client/utility app sections.
 * Navigation is configuration-driven (pass `navItems` from route layout).
 */
export function DashboardShell({ navItems, children, className, topBanner }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur md:hidden">
        <nav
          className="flex gap-2 overflow-x-auto px-4 py-3 text-sm"
          aria-label="App sections"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="flex">
        <aside
          className="hidden w-56 shrink-0 border-r bg-card md:block"
          aria-label="Sidebar navigation"
        >
          <nav className="flex flex-col gap-0.5 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className={cn("flex-1 p-4 md:p-8", className)}>
          {topBanner ? <div className="mb-6">{topBanner}</div> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
