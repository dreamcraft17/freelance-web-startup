import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),20rem] lg:items-start">
        <div className="nw-surface p-5 sm:p-7">
          <p className="nw-section-title">Nearby + remote marketplace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Find freelancers for real jobs, local or remote
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            Search by skill and city, review real profiles, and keep bids and messages tied to the job. NearWork is built
            for practical hiring, not promotional noise.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700">
            <MapPin className="h-4 w-4 shrink-0 text-[#433C93]" aria-hidden />
            Nearby cues are shown when freelancers share location details.
          </p>
        </div>

        <aside className="nw-surface-soft p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">How people use NearWork</p>
          <ul className="mt-3 space-y-3 text-sm text-slate-700">
            <li className="border-b border-slate-200/80 pb-3">Client posts a brief with budget and timeline.</li>
            <li className="border-b border-slate-200/80 pb-3">Freelancers submit targeted bids.</li>
            <li>Hiring, discussion, and context stay in one thread.</li>
          </ul>
        </aside>
      </div>

      <div className="nw-surface mt-5 p-3 sm:p-4">
        <form
          action="/freelancers"
          method="get"
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
        >
          <label className="flex min-h-[3rem] flex-1 cursor-text items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-2.5">
            <span className="sr-only">Search</span>
            <Search className="h-5 w-5 shrink-0 text-[#777587]" aria-hidden />
            <input
              name="keyword"
              type="search"
              placeholder="e.g. event photographer, reel edit"
              className="min-w-0 flex-1 border-0 bg-transparent text-left text-base text-[#191c1e] placeholder:text-[#777587] focus:outline-none focus:ring-0"
              autoComplete="off"
            />
          </label>
          <label className="flex min-h-[3rem] flex-1 cursor-text items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-2.5">
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
          <button type="submit" className="nw-cta-primary w-full shrink-0 px-5 py-3 sm:w-auto sm:px-6">
            Find freelancers near you
          </button>
        </form>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500 sm:text-sm">
        Add a city to prioritize nearby profiles; leave city empty to widen toward remote.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link
            href="/freelancers"
            className="inline-flex items-center gap-1.5 font-semibold text-[#3525cd] transition hover:underline"
          >
            Start searching now
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 font-semibold text-[#3525cd] transition hover:underline"
          >
            Browse open jobs
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <AuthAwareCtaLink
            href={"/client/jobs/new" as Route}
            intent="post-job"
            unauthenticatedTo="register"
            registerRoleHint="client"
            className="group inline-flex items-center gap-1.5 font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-[#3525cd] hover:decoration-[#3525cd]/40"
          >
            Post a brief and collect bids
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </AuthAwareCtaLink>
      </div>
    </section>
  );
}
