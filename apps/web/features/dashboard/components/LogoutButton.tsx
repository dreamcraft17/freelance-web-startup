"use client";

import { SignOutButton } from "./SignOutButton";

type LogoutButtonProps = {
  compact?: boolean;
  className?: string;
};

/** Reusable auth action alias used across dashboard surfaces. */
export function LogoutButton({ compact = false, className }: LogoutButtonProps) {
  return <SignOutButton compact={compact} className={className} />;
}
