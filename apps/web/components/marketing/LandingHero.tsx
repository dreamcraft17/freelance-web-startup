import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr),minmax(16rem,19rem)] lg:items-stretch lg:gap-6">
        <div className="nw-hero-panel flex flex-col justify-center">
          <p className="nw-section-title">Nearby + remote marketplace</p>
          <h1 className="mt-2 max-w-[22ch] text-3xl font-bold leading-[1.12] tracking-tight text-slate-950 sm:max-w-none sm:text-4xl lg:text-[2.35rem] lg:leading-[1.1]">
            Find freelancers for real jobs, local or remote
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-slate-700">
            Search by skill and city, review real profiles, and keep bids tied to the job—practical hiring, not noise.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-medium text-slate-800">
            <MapPin className="h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
            Nearby cues appear when freelancers share location.
          </p>
        </div>

        <aside className="flex flex-col justify-center border border-slate-200 bg-slate-50/90 px-4 py-5 sm:px-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">How it flows</p>
          <ul className="mt-3 space-y-3 text-sm font-medium leading-snug text-slate-800">
            <li className="border-b border-slate-200/90 pb-3">Client posts a brief with budget and timeline.</li>
            <li className="border-b border-slate-200/90 pb-3">Freelancers submit targeted bids.</li>
            <li className="text-slate-700">Hiring and context stay in one thread.</li>
          </ul>
        </aside>
      </div>

      <div className="nw-discovery-panel mt-6 sm:mt-7">
        <div className="mb-3 flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm font-semibold text-slate-900">Search the live directory</p>
          <p className="text-xs font-medium text-slate-500">Open listings · no sign-in required</p>
        </div>
        <form
          action="/freelancers"
          method="get"
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch"
        >
          <label className="flex min-h-[3rem] flex-1 cursor-text items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-2.5 transition focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20">
            <span className="sr-only">Search</span>
            <Search className="h-5 w-5 shrink-0 text-[#3525cd]" aria-hidden />
            <input
              name="keyword"
              type="search"
              placeholder="e.g. event photographer, reel edit"
              className="min-w-0 flex-1 border-0 bg-transparent text-left text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              autoComplete="off"
            />
          </label>
          <label className="flex min-h-[3rem] flex-1 cursor-text items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-2.5 transition focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20">
            <span className="sr-only">City</span>
            <MapPin className="h-5 w-5 shrink-0 text-[#3525cd]" aria-hidden />
            <input
              name="city"
              type="text"
              placeholder="City (e.g. Jakarta)"
              className="min-w-0 flex-1 border-0 bg-transparent text-left text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              autoComplete="address-level2"
            />
          </label>
          <button type="submit" className="nw-cta-primary w-full shrink-0 px-6 py-3.5 text-[15px] sm:w-auto">
            Find freelancers
          </button>
        </form>
      </div>

      <p className="mt-2.5 text-xs font-medium text-slate-600 sm:text-sm">
        Add a city for nearby-first results; leave it empty to bias toward remote.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3">
        <Link
          href="/freelancers"
          className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-[#3525cd] bg-white px-5 py-2.5 text-sm font-semibold text-[#3525cd] transition hover:bg-[#3525cd]/[0.06]"
        >
          Start searching
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Browse open jobs
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <AuthAwareCtaLink
          href={"/client/jobs/new" as Route}
          intent="post-job"
          unauthenticatedTo="register"
          registerRoleHint="client"
          className="nw-cta-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:ml-0"
        >
          Post a job
          <ArrowRight className="h-4 w-4" aria-hidden />
        </AuthAwareCtaLink>
      </div>
    </section>
  );
}
