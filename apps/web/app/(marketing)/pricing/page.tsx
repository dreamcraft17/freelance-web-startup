import type { Route } from "next";
import Link from "next/link";
import { AuthAwareCtaLink } from "@/features/auth/components/AuthAwareCtaLink";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <header className="nw-page-header mb-8">
        <p className="nw-section-title">Pricing</p>
        <h1 className="nw-page-title md:text-4xl">Simple and honest</h1>
        <p className="nw-page-description text-base leading-relaxed">
          NearWork is in <span className="font-medium text-slate-800">early access</span>. We are not selling you a plan
          today—we want real jobs, real profiles, and feedback while the product settles. Here is how money works right
          now (and what might change later).
        </p>
      </header>

      <div className="grid gap-4">
        <section className="nw-surface p-6 sm:p-7">
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

        <section className="nw-surface-soft px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
          <h2 className="text-base font-semibold text-indigo-950">Optional donation</h2>
          <p className="mt-3">
            If you want to help cover costs while we build, you may see an optional way to donate inside the product.
            It is entirely voluntary: skipping it does not limit your profile, your jobs, or how you show up in search.
          </p>
        </section>

        <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
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

      <section className="nw-surface mt-8 px-6 py-7 sm:px-8">
        <h2 className="text-xl font-semibold text-slate-900">Explore or join</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          You do not need a price sheet to try NearWork—look around, then sign up if it fits.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <AuthAwareCtaLink
            href={"/client/jobs/new" as Route}
            intent="post-job"
            unauthenticatedTo="register"
            registerRoleHint="client"
            className="nw-cta-primary inline-flex justify-center px-6 py-3"
          >
            Post a job free
          </AuthAwareCtaLink>
          <Link
            href="/register"
            className="inline-flex justify-center rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Create an account
          </Link>
          <Link
            href="/jobs"
            className="inline-flex justify-center rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Browse jobs
          </Link>
          <Link
            href="/freelancers"
            className="inline-flex justify-center px-1 py-3 text-sm font-semibold text-[#433C93] hover:underline"
          >
            Find freelancers
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-500">
          <Link href="/early-access" className="font-medium text-[#433C93] underline-offset-2 hover:underline">
            Early access details
          </Link>
          {" · "}
          <Link href="/help" className="font-medium text-[#433C93] underline-offset-2 hover:underline">
            Help
          </Link>
        </p>
      </section>
    </div>
  );
}
