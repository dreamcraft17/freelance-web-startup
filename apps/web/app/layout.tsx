import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "NearWork — Nearby or remote freelancers for every kind of work",
  description:
    "Find freelancers near you or anywhere: design, photography, video editing, writing, tutoring, marketing, local services, and more. Post jobs, compare bids, and collaborate in one place."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
