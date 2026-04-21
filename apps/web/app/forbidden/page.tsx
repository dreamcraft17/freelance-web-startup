import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server-translator";

export default async function ForbiddenPage() {
  const { t } = await getServerTranslator();

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{t("public.forbidden.title")}</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {t("public.forbidden.description")}
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link className="text-primary text-sm font-medium underline-offset-4 hover:underline" href="/login">
          {t("public.forbidden.signIn")}
        </Link>
        <Link className="text-primary text-sm font-medium underline-offset-4 hover:underline" href="/">
          {t("public.forbidden.home")}
        </Link>
      </div>
    </main>
  );
}
