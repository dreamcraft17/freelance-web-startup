import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function TermsPage() {
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {t("marketing.terms.title")}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {t("marketing.terms.subtitle")}
        </p>
      </header>
      <div className="max-w-none text-sm leading-relaxed text-slate-700">
        <p>{t("marketing.terms.body1")}</p>
        <p className="mt-4">{t("marketing.terms.body2")}</p>
        <p className="mt-4">
          {t("marketing.terms.questions")}{" "}
          <Link href="/help" className="font-semibold text-[#3525cd] hover:underline">
            {t("marketing.terms.helpLink")}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
