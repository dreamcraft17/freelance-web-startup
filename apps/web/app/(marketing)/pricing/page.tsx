import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Pricing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Simple and honest</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          NearWork is in <span className="font-medium text-slate-800">early access</span>. We are not selling you a plan
          today—we want real jobs, real profiles, and feedback while the product settles. Here is how money works right
          now (and what might change later).
        </p>
      </header>

      <div className="space-y-10">
        <section className="rounded-2xl bg-white/90 p-6 shadow-[0_2px_20px_-4px_rgba(53,37,205,0.08)] ring-1 ring-slate-200/60 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Currently free</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Using NearWork during early access does not require a paid subscription. You can browse public jobs and
            freelancer profiles, create an account, and use the core flows we have shipped without hitting a pricing
            gate.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            <span className="font-medium text-slate-900">No subscription is required right now.</span> If we ever ask
            for payment for platform access, we will say so clearly here and in-product first—not through hidden
            charges on work you already started.
          </p>
        </section>

        <section className="rounded-2xl bg-indigo-50/70 px-5 py-6 text-sm leading-relaxed text-slate-700 ring-1 ring-indigo-100 sm:px-6">
          <h2 className="text-base font-semibold text-indigo-950">Optional donation</h2>
          <p className="mt-3">
            If you want to help cover costs while we build, you may see an optional way to donate inside the product.
            It is entirely voluntary: skipping it does not limit your profile, your jobs, or how you show up in search.
          </p>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/80 px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">Future plans (later)</h2>
          <p className="mt-3">
            We may introduce paid options down the road—things like boosted visibility, team features, or other add-ons.
            Nothing is finalized; we will not publish fake price tags or countdowns to pressure you.
          </p>
          <p className="mt-3">
            When paid tiers exist, this page will list what you get and what it costs before we turn anything on for new
            charges.
          </p>
        </section>
      </div>

      <section className="mt-14 rounded-2xl bg-[#3525cd] px-6 py-10 text-center sm:px-10">
        <h2 className="text-xl font-semibold text-white">Explore or join</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-indigo-100">
          You do not need a price sheet to try NearWork—look around, then sign up if it fits.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/register"
            className="inline-flex justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#3525cd] transition hover:bg-indigo-50"
          >
            Create an account
          </Link>
          <Link
            href="/jobs"
            className="inline-flex justify-center rounded-lg border border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Browse jobs
          </Link>
          <Link
            href="/freelancers"
            className="inline-flex justify-center rounded-lg border border-transparent px-6 py-3 text-sm font-semibold text-white hover:underline"
          >
            Find freelancers
          </Link>
        </div>
        <p className="mt-6 text-xs text-indigo-200/90">
          <Link href="/early-access" className="font-medium text-white underline-offset-2 hover:underline">
            Early access details
          </Link>
          {" · "}
          <Link href="/help" className="font-medium text-white underline-offset-2 hover:underline">
            Help
          </Link>
        </p>
      </section>
    </div>
  );
}
