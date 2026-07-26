import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Fira_Code } from "next/font/google";
import { GlobalPageTransition } from "@/components/system/GlobalPageTransition";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/features/i18n/I18nProvider";
import { getMessagesForLocale } from "@/lib/i18n/dictionaries";
import { getAppLocale } from "@/lib/i18n/server-locale";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "NextWork | Early access",
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
    <html lang={locale} className={`scroll-smooth ${inter.variable} ${firaCode.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <ToastProvider>
            <I18nProvider initialLocale={locale} initialMessages={messages}>
              <GlobalPageTransition>{children}</GlobalPageTransition>
            </I18nProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
