import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}
