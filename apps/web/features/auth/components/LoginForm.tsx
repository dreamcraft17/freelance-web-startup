"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * UI-only form — wire to server action or API client from a data layer.
 * Default submit is blocked to avoid accidental navigation during scaffolding.
 */
export function LoginForm() {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full">
        Continue
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="underline underline-offset-4 hover:text-foreground">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}
