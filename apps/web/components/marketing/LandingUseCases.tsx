import Link from "next/link";
import { MapPin } from "lucide-react";

export function LandingUseCases() {
  return (
    <section className="nw-section-mist mt-2">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
      <div className="mb-6 flex items-end justify-between gap-4 border-b-2 border-[#3525cd]/15 pb-5">
        <div>
          <p className="nw-section-title">Common workflows</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">What people hire for</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-700">
            Three hiring shapes—pick the flow that matches how you work.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        <article className="border border-slate-200/90 border-t-[3px] border-t-[#3525cd] bg-white p-5 shadow-sm">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#3525cd]">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            On-site
          </p>
          <h3 className="mt-2.5 text-base font-bold text-slate-950">Event photographer in your city</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            City + nearby cues to shortlist people who can show up.
          </p>
        </article>
        <article className="border border-slate-200/90 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">Remote</p>
          <h3 className="mt-2.5 text-base font-bold text-slate-950">Editor for fast weekly content</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            Compare bids on turnaround, revisions, and scope.
          </p>
        </article>
        <article className="border border-slate-200/90 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">Hybrid</p>
          <h3 className="mt-2.5 text-base font-bold text-slate-950">Tutor: local + online follow-up</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            Set location and schedule expectations up front.
          </p>
        </article>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#3525cd]/15 pt-6 text-sm font-bold">
        <Link href="/freelancers" className="text-[#3525cd] transition hover:underline">
          Find freelancers
        </Link>
        <Link href="/jobs" className="text-[#3525cd] transition hover:underline">
          Browse jobs
        </Link>
        <Link href="/how-it-works" className="text-slate-700 transition hover:text-[#3525cd] hover:underline">
          How it works
        </Link>
      </div>
      </div>
    </section>
  );
}
