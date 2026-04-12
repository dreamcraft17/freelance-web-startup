import { Camera, Clapperboard, Globe, GraduationCap } from "lucide-react";

export function LandingUseCases() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 sm:mt-24 sm:px-8 lg:px-10">
      <p className="mb-8 max-w-md font-medium leading-snug text-slate-600 sm:mb-10 lg:mb-12 lg:max-w-sm">
        NearWork is built for real briefs—on-site work, tight deadlines, and hires you can explain to your team.
      </p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto] lg:gap-x-6 lg:gap-y-5">
        {/* Featured — spans left column, two rows on large screens */}
        <article className="rounded-[1.75rem] border border-slate-200/90 bg-white p-8 shadow-[0_2px_24px_-4px_rgba(15,23,42,0.08)] sm:p-10 lg:col-span-7 lg:row-span-2 lg:rounded-3xl lg:p-11 lg:pr-10">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Camera className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <h2 className="mb-3 text-2xl font-semibold leading-tight tracking-tight text-[#191c1e] sm:text-3xl">
            Need a photographer for an event?
          </h2>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Filter for people who can show up in your city, then compare portfolios and day rates in one thread—no
            scattered DMs.
          </p>
        </article>

        <article className="rounded-2xl bg-[#eceef0] p-7 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end lg:rounded-2xl lg:p-8">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-[#3f465c] shadow-sm">
            <Clapperboard className="h-5 w-5" strokeWidth={1.6} aria-hidden />
          </div>
          <h2 className="mb-2 text-lg font-semibold leading-snug text-[#191c1e] sm:text-xl">
            Quick turnaround on edits?
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Editors bid with turnaround and revision limits spelled out—useful when launch is Friday.
          </p>
        </article>

        <article className="rounded-[1.35rem] border border-dashed border-slate-300/70 bg-[#f2f4f6]/90 p-7 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:mt-2 lg:rounded-2xl lg:p-8">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-[#7b2f00]">
            <GraduationCap className="h-5 w-5" strokeWidth={1.6} aria-hidden />
          </div>
          <h2 className="mb-2 text-lg font-semibold leading-snug text-[#191c1e] sm:text-xl">
            Tutor within a few kilometers?
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Put neighborhood or district in the brief so responses match how far you are willing to travel.
          </p>
        </article>

        <article className="border-l-[3px] border-indigo-600 bg-slate-100/80 py-6 pl-6 pr-5 sm:py-7 sm:pl-8 sm:pr-8 lg:col-span-10 lg:col-start-1 lg:row-start-3 lg:mt-2">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-100 text-[#3525cd]">
            <Globe className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-[#191c1e] sm:text-xl">Remote-only is fine too</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Same flow: post scope, get bids, pick someone in another city when the work ships online.
          </p>
        </article>
      </div>
    </section>
  );
}
