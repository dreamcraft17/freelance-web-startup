import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function PrivacyPage() {
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {t("marketing.privacy.title")}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {t("marketing.privacy.subtitle")}
        </p>
      </header>
      <div className="max-w-none text-sm leading-relaxed text-slate-700">
        <p>{t("marketing.privacy.body1")}</p>
        <p className="mt-4">
          {t("marketing.privacy.questions")}{" "}
          <Link href="/help" className="font-semibold text-[#3525cd] hover:underline">
            {t("marketing.privacy.helpLink")}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
