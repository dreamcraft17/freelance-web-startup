import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function HelpPage() {
  const { t } = await getServerTranslator();
  const helpTopics = [
    { title: t("marketing.help.topic1Title"), blurb: t("marketing.help.topic1Body") },
    { title: t("marketing.help.topic2Title"), blurb: t("marketing.help.topic2Body") },
    { title: t("marketing.help.topic3Title"), blurb: t("marketing.help.topic3Body") },
    { title: t("marketing.help.topic4Title"), blurb: t("marketing.help.topic4Body") },
    { title: t("marketing.help.topic5Title"), blurb: t("marketing.help.topic5Body") }
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <header className="nw-page-header mb-8">
        <p className="nw-section-title">{t("marketing.help.sectionTitle")}</p>
        <h1 className="nw-page-title md:text-4xl">{t("marketing.help.pageTitle")}</h1>
        <p className="nw-page-description text-base leading-relaxed">
          {t("marketing.help.description")}
        </p>
      </header>

      <section className="nw-surface mb-6 p-6 sm:p-7">
        <h2 className="text-lg font-semibold text-slate-900">{t("marketing.help.contactTitle")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          {t("marketing.help.contactBody")}
        </p>
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800">
          support@nearwork.example
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {t("marketing.help.contactNote")}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">{t("marketing.help.topicsTitle")}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {t("marketing.help.topicsBody")}
        </p>
        <ul className="mt-5 space-y-4">
          {helpTopics.map((t) => (
            <li
              key={t.title}
              className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <span className="font-semibold text-slate-900">{t.title}</span>
              <span className="mt-1 block leading-relaxed text-slate-600">{t.blurb}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">{t("marketing.help.selfServeTitle")}</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5">
          <li>
            <Link href="/how-it-works" className="font-medium text-[#3525cd] hover:underline">
              {t("nav.howItWorks")}
            </Link>{" "}
            — {t("marketing.help.selfServeItem1Suffix")}
          </li>
          <li>
            <Link href="/early-access" className="font-medium text-[#3525cd] hover:underline">
              {t("marketing.help.earlyAccess")}
            </Link>{" "}
            — {t("marketing.help.selfServeItem2Suffix")}
          </li>
          <li>
            <Link href="/pricing" className="font-medium text-[#3525cd] hover:underline">
              {t("nav.pricing")}
            </Link>{" "}
            — {t("marketing.help.selfServeItem3Suffix")}
          </li>
        </ul>
      </section>

      <p className="mt-10 text-xs text-slate-400">
        <Link href="/privacy" className="text-[#3525cd] hover:underline">
          {t("footer.privacy")}
        </Link>
        {" · "}
        <Link href="/terms" className="text-[#3525cd] hover:underline">
          {t("footer.terms")}
        </Link>
      </p>
    </div>
  );
}
