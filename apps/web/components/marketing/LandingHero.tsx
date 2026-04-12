import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Search } from "lucide-react";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 pt-10 text-center sm:px-6 sm:pb-20 sm:pt-12">
      {/* Text stack — centered, readable width */}
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#3f465c]">
          <BadgeCheck className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
          Currently in early access
        </div>

        <h1 className="mb-5 text-balance text-4xl font-bold leading-[1.12] tracking-tight text-[#191c1e] sm:text-5xl md:text-[2.65rem] md:leading-[1.1]">
          Find nearby or remote freelancers{" "}
          <span className="font-medium italic text-[#3525cd]">without the hassle</span>
        </h1>

        <p className="text-pretty text-lg leading-relaxed text-[#464555] sm:text-xl">
          Post a shoot in <span className="font-semibold text-slate-800">Jakarta</span>, book a tutor in your district,
          or hire an editor in another time zone—briefs, bids, and messages stay on the job.
        </p>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-slate-500 sm:text-base">
          <span className="font-medium text-slate-600">Nearby</span> when you need someone on-site ·{" "}
          <span className="font-medium text-slate-600">Remote</span> when location does not matter.
        </p>
      </div>

      {/* Search — slightly narrower than copy for visual balance */}
      <form
        action="/freelancers"
        method="get"
        className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 shadow-[0_20px_40px_-12px_rgba(53,37,205,0.1)] outline outline-1 outline-[#c7c4d8]/25 sm:mt-10 sm:flex-row sm:items-center"
      >
        <label className="flex min-h-[3rem] flex-1 cursor-text items-center gap-3 border-b border-[#c7c4d8]/20 px-4 py-2.5 sm:border-b-0 sm:border-r sm:py-2">
          <span className="sr-only">Search</span>
          <Search className="h-5 w-5 shrink-0 text-[#777587]" aria-hidden />
          <input
            name="q"
            type="search"
            placeholder="e.g. event photographer, reel edit"
            className="min-w-0 flex-1 border-0 bg-transparent text-left text-base text-[#191c1e] placeholder:text-[#777587] focus:outline-none focus:ring-0"
            autoComplete="off"
          />
        </label>
        <label className="flex min-h-[3rem] flex-1 cursor-text items-center gap-3 px-4 py-2.5 sm:py-2">
          <span className="sr-only">City</span>
          <MapPin className="h-5 w-5 shrink-0 text-[#777587]" aria-hidden />
          <input
            name="city"
            type="text"
            placeholder="City (e.g. Jakarta)"
            className="min-w-0 flex-1 border-0 bg-transparent text-left text-base text-[#191c1e] placeholder:text-[#777587] focus:outline-none focus:ring-0"
            autoComplete="address-level2"
          />
        </label>
        <button
          type="submit"
          className="w-full shrink-0 rounded-lg bg-[#3525cd] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f46e5] active:scale-[0.98] sm:w-auto sm:px-6"
        >
          Search services near you
        </button>
      </form>

      <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-relaxed text-slate-400 sm:text-sm">
        Leave city empty to include remote freelancers in results.
      </p>

      <div className="mx-auto mt-8 flex max-w-xl flex-col items-center justify-center gap-4 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
        <Link
          href="/freelancers"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3525cd] transition hover:underline"
        >
          Start finding freelancers
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
        <Link
          href="/register"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-[#3525cd] hover:decoration-[#3525cd]/40"
        >
          Post a brief and collect bids
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
