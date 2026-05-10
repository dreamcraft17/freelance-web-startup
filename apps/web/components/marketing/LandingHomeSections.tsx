import type { Route } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  ClipboardList,
  Handshake,
  Inbox,
  MessageSquare,
  Shield,
  Sparkles,
  Users
} from "lucide-react";
import { getServerTranslator } from "@/lib/i18n/server-translator";
import { withPublicLocale } from "@/lib/i18n/locale-path";
import { withWorkspaceLocale } from "@/lib/i18n/workspace-path";

export async function LandingHomeSections() {
  const { t, locale } = await getServerTranslator();

  const pub = (path: string) => withPublicLocale(locale, path) as Route;
  const ws = (path: string) => withWorkspaceLocale(locale, path) as Route;

  const howSteps = [
    {
      icon: ClipboardList,
      titleKey: "landing.home.how.steps.post.title",
      bodyKey: "landing.home.how.steps.post.body"
    },
    {
      icon: Inbox,
      titleKey: "landing.home.how.steps.proposals.title",
      bodyKey: "landing.home.how.steps.proposals.body"
    },
    {
      icon: MessageSquare,
      titleKey: "landing.home.how.steps.chat.title",
      bodyKey: "landing.home.how.steps.chat.body"
    },
    {
      icon: Handshake,
      titleKey: "landing.home.how.steps.hire.title",
      bodyKey: "landing.home.how.steps.hire.body"
    }
  ] as const;

  const clientBenefits = [
    "landing.home.clients.bullets.scope",
    "landing.home.clients.bullets.thread",
    "landing.home.clients.bullets.modes"
  ] as const;

  const freelancerBenefits = [
    "landing.home.freelancers.bullets.discovery",
    "landing.home.freelancers.bullets.proposals",
    "landing.home.freelancers.bullets.clarity"
  ] as const;

  return (
    <div className="border-t border-slate-200/80 bg-gradient-to-b from-[#faf9fc] via-white to-[#f6f5fb]">
      <div className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 sm:py-16">
        <section aria-labelledby="landing-how-heading" className="rounded-3xl border border-slate-200/70 bg-white/80 px-5 py-10 shadow-[0_24px_80px_-48px_rgba(53,37,205,0.35)] backdrop-blur-sm sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3525cd]">{t("landing.home.how.kicker")}</p>
          <h2 id="landing-how-heading" className="mt-2 max-w-3xl text-2xl font-bold tracking-tight text-[#071027] sm:text-3xl">
            {t("landing.home.how.title")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{t("landing.home.how.subtitle")}</p>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.titleKey}
                  className="relative rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-[#f8f7fd] p-5 pt-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                >
                  <span className="absolute left-5 top-4 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-[#3525cd]/10 px-2 text-xs font-bold text-[#3525cd]">
                    {idx + 1}
                  </span>
                  <div className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3525cd]/10 text-[#3525cd]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#071027]">{t(step.titleKey)}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t(step.bodyKey)}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="landing-audience-heading">
          <div className="text-center">
            <h2 id="landing-audience-heading" className="text-2xl font-bold tracking-tight text-[#071027] sm:text-3xl">
              {t("landing.home.split.title")}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">{t("landing.home.split.subtitle")}</p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.25)] sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#3525cd]/10 px-3 py-1 text-xs font-semibold text-[#3525cd]">
                <Users className="h-3.5 w-3.5" aria-hidden />
                {t("landing.home.clients.kicker")}
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#071027]">{t("landing.home.clients.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("landing.home.clients.lead")}</p>
              <ul className="mt-5 space-y-3">
                {clientBenefits.map((key) => (
                  <li key={key} className="flex gap-3 text-sm text-slate-700">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={ws("/client/jobs/new")}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3525cd] px-5 text-sm font-semibold text-white transition hover:bg-[#2b1da8]"
              >
                {t("landing.home.clients.cta")}
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-[#0f172a] p-6 text-white shadow-[0_18px_60px_-40px_rgba(53,37,205,0.45)] sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {t("landing.home.freelancers.kicker")}
              </div>
              <h3 className="mt-4 text-xl font-bold">{t("landing.home.freelancers.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{t("landing.home.freelancers.lead")}</p>
              <ul className="mt-5 space-y-3">
                {freelancerBenefits.map((key) => (
                  <li key={key} className="flex gap-3 text-sm text-white/85">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={pub("/jobs")}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-[#071027] transition hover:bg-slate-100"
              >
                {t("landing.home.freelancers.cta")}
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="landing-trust-heading">
          <div className="grid gap-5 lg:grid-cols-12 lg:items-stretch">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 lg:col-span-7">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
                <Shield className="h-5 w-5" aria-hidden />
              </div>
              <h2 id="landing-trust-heading" className="mt-4 text-xl font-bold text-[#071027] sm:text-2xl">
                {t("landing.home.trust.title")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{t("landing.home.trust.body")}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">{t("landing.home.trust.body2")}</p>
              <Link href={pub("/help")} className="mt-5 inline-flex text-sm font-semibold text-[#3525cd] hover:underline">
                {t("landing.home.trust.helpLink")}
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-3xl border border-[#3525cd]/25 bg-gradient-to-br from-[#3525cd] to-[#4f35e8] p-6 text-white sm:p-8 lg:col-span-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{t("landing.home.early.kicker")}</p>
                <h3 className="mt-2 text-xl font-bold sm:text-2xl">{t("landing.home.early.title")}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/85">{t("landing.home.early.body")}</p>
              </div>
              <Link
                href={pub("/early-access")}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-white px-5 text-center text-sm font-semibold text-[#3525cd] transition hover:bg-slate-100 lg:w-auto"
              >
                {t("landing.home.early.cta")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
