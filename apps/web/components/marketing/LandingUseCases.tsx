import Link from "next/link";
import { MapPin } from "lucide-react";

export function LandingUseCases() {
  return (
    <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <p className="nw-section-title">Common workflows</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">What people hire for</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="nw-surface p-5">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-[#433C93]" aria-hidden />
            On-site
          </p>
          <h3 className="mt-2 text-base font-semibold text-slate-900">Event photographer in your city</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Use city + nearby cues to shortlist people who can actually show up.
          </p>
        </article>
        <article className="nw-surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Remote</p>
          <h3 className="mt-2 text-base font-semibold text-slate-900">Editor for fast weekly content</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Compare bids by turnaround, revision limits, and delivery scope.
          </p>
        </article>
        <article className="nw-surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Hybrid</p>
          <h3 className="mt-2 text-base font-semibold text-slate-900">Tutor with local sessions + online follow-up</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Set expectations upfront so location and schedule stay realistic.
          </p>
        </article>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
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
