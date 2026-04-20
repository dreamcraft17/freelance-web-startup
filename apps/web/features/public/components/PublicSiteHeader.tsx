import type { Route } from "next";
import Link from "next/link";
import { getSessionFromCookies } from "@src/lib/auth";
import { AuthUserMenu } from "@/features/dashboard/components/AuthUserMenu";
import { LocaleSwitcher } from "@/features/i18n/LocaleSwitcher";
import { primaryActionForRole, secondaryActionForRole } from "@/features/public/lib/auth-nav";
import { BrandLogo } from "@/features/shared/components/BrandLogo";
import { getServerTranslator } from "@/lib/i18n/server-translator";

/** Lightweight header for browse/search surfaces (jobs, freelancers, nearby). */
export async function PublicSiteHeader() {
  const { t } = await getServerTranslator();
  const session = await getSessionFromCookies();
  const primary = session ? primaryActionForRole(session.role) : null;
  const secondary = session ? secondaryActionForRole(session.role) : null;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[3.25rem] max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <Link href={"/" as Route} className="shrink-0" aria-label={t("publicHeader.homeAria")}>
          <BrandLogo imageClassName="h-8 w-auto" alt="NearWork logo" />
        </Link>
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Link
            href="/jobs"
            className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          >
            {t("nav.jobs")}
          </Link>
          <Link
            href="/freelancers"
            className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-900"
          >
            {t("nav.freelancers")}
          </Link>
          <span className="mx-0.5 hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
          <LocaleSwitcher />
          {primary ? (
            <>
              {secondary ? (
                <Link
                  href={secondary.href as Route}
                  className="hidden rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
                >
                  {t(secondary.labelKey)}
                </Link>
              ) : null}
              <Link href={primary.href as Route} className="nw-cta-primary shrink-0 px-3 py-1.5 text-sm">
                {t(primary.labelKey)}
              </Link>
              <AuthUserMenu compact />
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                {t("nav.register")}
              </Link>
              <Link href="/login" className="nw-cta-primary shrink-0 px-3 py-1.5 text-sm">
                {t("nav.logIn")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
