import Link from "next/link";
import { Rocket } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-36 md:pb-40 md:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-96 w-96 max-w-full translate-x-1/4 rounded-full bg-[#3525cd]/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 max-w-full -translate-x-1/4 rounded-full bg-orange-100/40 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3323cc]">
          <Rocket className="h-3.5 w-3.5" aria-hidden />
          Now in early access
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
          Find nearby or remote freelancers{" "}
          <span className="bg-gradient-to-r from-[#3525cd] to-indigo-600 bg-clip-text italic text-transparent">
            without the hassle
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
          From design and photography to editing, tutoring, marketing, and local services—hire in your area or
          anywhere. One marketplace for scoped work, clear bids, and real collaboration.
        </p>

        <div className="flex w-full flex-col items-stretch justify-center gap-4 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/freelancers"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3525cd] to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-[0_24px_48px_-16px_rgba(53,37,205,0.35)] transition hover:opacity-95 active:scale-[0.98]"
          >
            Find freelancers
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
          >
            Post a job free
          </Link>
        </div>
      </div>
    </section>
  );
}
