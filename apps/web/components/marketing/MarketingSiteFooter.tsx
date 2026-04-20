import type { Route } from "next";
import Link from "next/link";
import type { Translator } from "@/lib/i18n/create-translator";
import { getServerTranslator } from "@/lib/i18n/server-translator";

type FooterLink = { href: Route; labelKey: string };

const productLinks: FooterLink[] = [
  { href: "/jobs", labelKey: "footer.findJobs" },
  { href: "/freelancers", labelKey: "footer.findFreelancers" }
];

const companyLinks: FooterLink[] = [
  { href: "/how-it-works", labelKey: "footer.about" },
  { href: "/pricing", labelKey: "footer.pricing" },
  { href: "/early-access", labelKey: "footer.earlyAccess" }
];

const legalLinks: FooterLink[] = [
  { href: "/privacy", labelKey: "footer.privacy" },
  { href: "/terms", labelKey: "footer.terms" }
];

const supportLinks: FooterLink[] = [
  { href: "/help", labelKey: "footer.help" },
  { href: "/contact", labelKey: "footer.contact" }
];

function LinkColumn({ titleKey, links, t }: { titleKey: string; links: FooterLink[]; t: Translator }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t(titleKey)}</p>
      <ul className="mt-2 space-y-1.5">
        {links.map(({ href, labelKey }) => (
          <li key={href}>
            <Link href={href} className="text-xs font-medium text-slate-600 transition hover:text-[#3525cd]">
              {t(labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function MarketingSiteFooter() {
  const { t } = await getServerTranslator();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50/90">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-7">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link href="/" className="text-sm font-bold tracking-tight text-slate-900 hover:text-[#3525cd]">
              NearWork
            </Link>
            <p className="mt-1.5 max-w-xs text-xs leading-snug text-slate-500">{t("footer.tagline")}</p>
          </div>

          <nav
            className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:col-span-8 lg:justify-end"
            aria-label="Footer"
          >
            <LinkColumn titleKey="footer.product" links={productLinks} t={t} />
            <LinkColumn titleKey="footer.company" links={companyLinks} t={t} />
            <LinkColumn titleKey="footer.legal" links={legalLinks} t={t} />
            <LinkColumn titleKey="footer.support" links={supportLinks} t={t} />
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-slate-200/90 pt-4 text-[11px] font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright", { year })}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href="/privacy" className="hover:text-[#3525cd]">
              {t("footer.privacy")}
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link href="/terms" className="hover:text-[#3525cd]">
              {t("footer.terms")}
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link href="/login" className="hover:text-[#3525cd]">
              {t("nav.logIn")}
            </Link>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <Link href="/register" className="hover:text-[#3525cd]">
              {t("nav.register")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
