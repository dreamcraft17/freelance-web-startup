import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Pricing</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          NearWork is in <span className="font-semibold text-slate-800">early access</span>. We are focused on real
          hiring flows—not locking you behind a paywall on day one.
        </p>
      </header>

      <div className="space-y-8 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Right now: free to use</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Posting jobs, browsing freelancers, and core messaging stay free while we harden payouts and polish the
            product. No subscription is required to explore or hire during this phase.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Optional donations</h2>
          <p className="mt-2 text-sm leading-relaxed">
            If you want to support development, you can leave a donation from the product when that flow is linked to
            your checkout provider. It never affects visibility of your profile or jobs.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Later: paid plans (TBD)</h2>
          <p className="mt-2 text-sm leading-relaxed">
            We may introduce paid tiers for things like boosted placement, higher bid limits, or team seats. When we
            do, we will publish clear pricing here first—no surprise charges on existing usage.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/early-access"
          className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
        >
          Read about early access
        </Link>
        <Link href="/help" className="text-sm font-semibold text-[#3525cd] hover:underline">
          Help & contact →
        </Link>
      </div>
    </div>
  );
}
