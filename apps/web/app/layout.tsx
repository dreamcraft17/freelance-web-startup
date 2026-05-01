import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { GlobalPageTransition } from "@/components/system/GlobalPageTransition";
import { I18nProvider } from "@/features/i18n/I18nProvider";
import { getMessagesForLocale } from "@/lib/i18n/dictionaries";
import { getAppLocale } from "@/lib/i18n/server-locale";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "NearWork | Early access",
  description:
    "Find freelancers near you or anywhere: design, photography, video editing, writing, tutoring, marketing, local services, and more. Post jobs, compare bids, and collaborate in one place.",
  icons: {
    icon: [{ url: "/logo/logo_EN.png", type: "image/png" }],
    shortcut: ["/logo/logo_EN.png"],
    apple: ["/logo/logo_EN.png"]
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getAppLocale();
  const messages = getMessagesForLocale(locale);

  return (
    <html lang={locale} className={`scroll-smooth ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <I18nProvider initialLocale={locale} initialMessages={messages}>
          <GlobalPageTransition>{children}</GlobalPageTransition>
        </I18nProvider>
      </body>
    </html>
  );
}
