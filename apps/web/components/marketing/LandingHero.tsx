import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";

const trendingSearches: { label: string; href: Route }[] = [
  { label: "Wedding photographer", href: "/freelancers?keyword=wedding+photographer" },
  { label: "Video editor", href: "/freelancers?keyword=video+editor" },
  { label: "Social media", href: "/freelancers?keyword=social+media" },
  { label: "Tutor math", href: "/freelancers?keyword=tutor+math" },
  { label: "Brand design", href: "/freelancers?keyword=brand+design" }
];

export function LandingHero() {
  return (
    <section className="nw-hero-stage">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-xs font-medium tracking-tight text-slate-500">
              Live freelancer directory
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.06] lg:text-[2.75rem] xl:text-[2.9rem]">
              Hire freelancers for real work—nearby or remote
            </h1>
            <p className="mt-4 max-w-xl text-lg font-semibold leading-snug text-slate-800">
              Search live profiles, compare bids on open jobs, and keep every conversation tied to the brief.
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#3525cd]" aria-hidden />
              <span>City + optional browser location surface nearby talent when freelancers share coordinates.</span>
            </p>
          </div>

          <aside className="flex flex-col justify-between border border-slate-200 bg-slate-50/90 p-5 sm:p-6 lg:col-span-5 lg:rounded-lg lg:border-slate-200/90 lg:bg-[#3525cd]/[0.06] lg:shadow-sm">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3525cd]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                How hiring runs
              </p>
              <ol className="mt-4 space-y-3 text-sm font-semibold leading-snug text-slate-900">
                <li className="flex gap-2">
                  <span className="font-mono text-xs font-bold text-[#3525cd]">1</span>
                  Post a brief or browse the directory.
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-xs font-bold text-[#3525cd]">2</span>
                  Review bids and profiles in context.
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-xs font-bold text-[#3525cd]">3</span>
                  Message and decide without leaving the job thread.
                </li>
              </ol>
            </div>
            <p className="mt-6 border-t border-slate-200/80 pt-4 text-xs font-medium leading-relaxed text-slate-600 lg:border-[#3525cd]/10">
              No sign-in required to search—create an account when you are ready to post or bid.
            </p>
          </aside>
        </div>

        <div className="mt-10 rounded-2xl border-2 border-slate-200 bg-[#f8f9fb] p-3 shadow-sm sm:mt-12 sm:p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="text-base font-bold text-slate-900">Search the live directory</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Real listings · updates with the community</p>
            </div>
          </div>
          <form
            action="/freelancers"
            method="get"
            className="flex w-full flex-col gap-3 lg:flex-row lg:items-stretch"
          >
            <label className="flex min-h-[3.5rem] flex-1 cursor-text items-center gap-3 rounded-xl border-2 border-white bg-white px-4 py-3 shadow-sm transition focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20 lg:min-h-[3.75rem] lg:flex-[1.2]">
              <span className="sr-only">Search</span>
              <Search className="h-6 w-6 shrink-0 text-[#3525cd]" aria-hidden />
              <input
                name="keyword"
                type="search"
                placeholder="What do you need? e.g. shoot, edit, tutor…"
                className="min-w-0 flex-1 border-0 bg-transparent text-left text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-lg"
                autoComplete="off"
              />
            </label>
            <label className="flex min-h-[3.5rem] flex-1 cursor-text items-center gap-3 rounded-xl border-2 border-white bg-white px-4 py-3 shadow-sm transition focus-within:border-[#3525cd] focus-within:ring-2 focus-within:ring-[#3525cd]/20 lg:min-h-[3.75rem]">
              <span className="sr-only">City</span>
              <MapPin className="h-6 w-6 shrink-0 text-[#3525cd]" aria-hidden />
              <input
                name="city"
                type="text"
                placeholder="City (optional)"
                className="min-w-0 flex-1 border-0 bg-transparent text-left text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-lg"
                autoComplete="address-level2"
              />
            </label>
            <button
              type="submit"
              className="nw-cta-primary shrink-0 rounded-xl px-8 py-3.5 text-base font-bold shadow-sm lg:px-10"
            >
              Search
            </button>
          </form>

          <div className="mt-4 border-t border-slate-200/90 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Popular searches</p>
            <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
              {trendingSearches.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition hover:border-[#3525cd]/40 hover:text-[#3525cd]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-xs font-medium text-slate-600 sm:text-left sm:text-sm">
          Add a city to bias toward nearby profiles; leave it empty for broader remote results.
        </p>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3">
          <Link
            href="/freelancers"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#3525cd] bg-white px-6 py-3 text-sm font-bold text-[#3525cd] transition hover:bg-[#3525cd]/[0.06]"
          >
            Open directory
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Open job board
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <AuthAwareCtaLink
            href={"/client/jobs/new" as Route}
            intent="post-job"
            unauthenticatedTo="register"
            registerRoleHint="client"
            className="nw-cta-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold sm:ml-0"
          >
            Post a job
            <ArrowRight className="h-4 w-4" aria-hidden />
          </AuthAwareCtaLink>
        </div>
      </div>
    </section>
  );
}
