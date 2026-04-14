import type { ReactNode } from "react";

/** Main column wrapper: consistent padding and max width for internal admin pages. */
export function AdminMainContent({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-3rem)] bg-[#f6f7f9] px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto w-full max-w-[1600px]">{children}</div>
    </div>
  );
}
