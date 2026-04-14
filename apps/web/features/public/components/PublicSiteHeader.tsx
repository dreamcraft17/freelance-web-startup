import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSessionFromCookies } from "@src/lib/auth";
import { AuthUserMenu } from "@/features/dashboard/components/AuthUserMenu";
import { primaryActionForRole, secondaryActionForRole } from "@/features/public/lib/auth-nav";
import { BrandLogo } from "@/features/shared/components/BrandLogo";

/** Lightweight header for browse/search surfaces (jobs, freelancers, nearby). */
export async function PublicSiteHeader() {
  const session = await getSessionFromCookies();
  const primary = session ? primaryActionForRole(session.role) : null;
  const secondary = session ? secondaryActionForRole(session.role) : null;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <BrandLogo imageClassName="h-8 w-auto" alt="NearWork logo" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">Jobs</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/freelancers">Freelancers</Link>
          </Button>
          {primary ? (
            <>
              {secondary ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={secondary.href as Route}>{secondary.label}</Link>
                </Button>
              ) : null}
              <Button size="sm" asChild>
                <Link href={primary.href as Route}>{primary.label}</Link>
              </Button>
              <AuthUserMenu compact />
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
