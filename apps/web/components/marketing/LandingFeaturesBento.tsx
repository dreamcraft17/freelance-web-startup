import Link from "next/link";
import { Bolt, Globe, MapPin } from "lucide-react";

export function LandingFeaturesBento() {
  return (
    <section className="bg-slate-100/80 px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Wide card — nearby */}
          <div className="flex flex-col items-center gap-8 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_40px_60px_-20px_rgba(53,37,205,0.08)] outline outline-1 outline-slate-200/40 md:col-span-8 md:flex-row md:p-12">
            <div className="flex-1">
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Nearby freelancers
              </h2>
              <p className="leading-relaxed text-slate-600">
                When you need someone on-site—a shoot, an install, a lesson—discovery respects location. Keep the same
                thread if the work moves remote later.
              </p>
            </div>
            <div className="relative h-56 w-full flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-100 to-indigo-50 outline outline-1 outline-slate-200/30 md:h-72">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-[#3525cd]/90">
                  <MapPin className="h-14 w-14" strokeWidth={1.25} aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Radius-aware</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" aria-hidden />
            </div>
          </div>

          {/* Tall accent — fast flow */}
          <div className="flex flex-col justify-between rounded-[2rem] bg-[#3525cd] p-8 text-white shadow-lg md:col-span-4">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Bolt className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h2 className="mb-2 text-2xl font-semibold">From brief to bids</h2>
              <p className="text-sm leading-relaxed text-indigo-100">
                Post scope, budget, and how work is delivered. Freelancers respond with proposals you can compare in one
                place—no inbox archaeology.
              </p>
            </div>
          </div>

          {/* Remote + onsite */}
          <div className="flex flex-col gap-6 rounded-[2rem] border border-slate-200/80 bg-white p-8 outline outline-1 outline-slate-200/40 md:col-span-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-[#3525cd]">
              <Globe className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h2 className="mb-2 text-xl font-semibold text-slate-900">Remote + on-site</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Set expectations up front: fully remote, hybrid, or local-only. The brief carries the rules.
              </p>
            </div>
          </div>

          {/* Early access banner */}
          <div className="flex flex-col items-center gap-8 rounded-[2rem] border border-orange-100/80 bg-gradient-to-br from-orange-50 to-amber-50 p-8 md:col-span-8 md:flex-row md:p-12">
            <div className="flex-1">
              <h2 className="mb-4 text-2xl font-semibold text-slate-900 md:text-3xl">Free early access</h2>
              <p className="leading-relaxed text-slate-700/90">
                Post jobs, browse talent, and use core messaging while we finish payouts and polish. No credit card to
                explore.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/register"
                className="inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
              >
                Claim access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
