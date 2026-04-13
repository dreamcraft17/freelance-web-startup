import Link from "next/link";
import { MapPin } from "lucide-react";

export function LandingUseCases() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 sm:mt-24 sm:px-8 lg:px-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto] lg:gap-x-6 lg:gap-y-5">
        {/* Featured — nearby-first, no big icon tile */}
        <article className="rounded-[1.75rem] bg-white p-8 shadow-[0_2px_28px_-6px_rgba(15,23,42,0.1)] sm:p-10 lg:col-span-7 lg:row-span-2 lg:rounded-3xl lg:p-11 lg:pr-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-800">
            <MapPin className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
            Nearby first
          </div>
          <h2 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-[#191c1e] sm:text-3xl">
            Need a photographer for an event?
          </h2>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Filter for people who can show up in your city, then compare portfolios and day rates in one thread—no
            scattered DMs.
          </p>
        </article>

        <article className="rounded-2xl bg-gradient-to-br from-[#eceef0] to-slate-100/80 p-7 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end lg:p-8">
          <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">Fast hire</p>
          <h2 className="mb-2 text-lg font-semibold leading-snug text-[#191c1e] sm:text-xl">Quick turnaround on edits?</h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Editors bid with turnaround and revision limits spelled out—useful when launch is Friday.
          </p>
        </article>

        <article className="rounded-2xl border border-dashed border-slate-300/80 bg-[#f7f9fb] p-7 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:mt-2 lg:p-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-orange-800/80">Within reach</p>
          <h2 className="mb-2 text-lg font-semibold leading-snug text-[#191c1e] sm:text-xl">Tutor within a few kilometers?</h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Put neighborhood or district in the brief so responses match how far you are willing to travel.
          </p>
        </article>

        <article className="border-l-[3px] border-l-indigo-600 bg-slate-50/50 py-7 pl-7 pr-6 sm:py-8 sm:pl-9 lg:col-span-10 lg:col-start-1 lg:row-start-3 lg:mt-2 lg:rounded-r-xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Anywhere</p>
          <h2 className="mb-2 text-lg font-semibold text-[#191c1e] sm:text-xl">Remote-only is fine too</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Same flow: post scope, get bids, pick someone in another city when the work ships online.
          </p>
        </article>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
        <Link href="/freelancers" className="font-semibold text-[#3525cd] transition hover:underline">
          Find freelancers
        </Link>
        <Link href="/jobs" className="font-semibold text-[#3525cd] transition hover:underline">
          Browse jobs
        </Link>
        <Link href="/how-it-works" className="font-semibold text-slate-600 transition hover:text-[#3525cd] hover:underline">
          How it works
        </Link>
      </div>
    </section>
  );
}
