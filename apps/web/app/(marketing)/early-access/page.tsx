import Link from "next/link";

export default function EarlyAccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">NearWork</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Early access</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          We are shipping in public: real jobs, real freelancers, and honest limits—while we finish payments and edge
          cases.
        </p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-base font-semibold text-slate-900">Why early access exists</h2>
          <p className="mt-2">
            A marketplace only works if briefs and bids feel trustworthy. We would rather grow with a small, vocal
            community than fake scale.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-slate-900">What you can do today</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Browse open jobs and freelancer profiles</li>
            <li>Post jobs and collect bids (as a client)</li>
            <li>Lean on city and work mode when nearby work matters</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-slate-900">What is still evolving</h2>
          <p className="mt-2">
            Payouts, dispute tooling, and some polish paths are not finished. If something breaks, use{" "}
            <Link href="/help" className="font-semibold text-[#3525cd] hover:underline">
              Help
            </Link>{" "}
            so we can prioritize fixes.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/register"
          className="inline-flex justify-center rounded-lg bg-[#3525cd] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
        >
          Join with an account
        </Link>
        <Link
          href="/freelancers"
          className="inline-flex justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Find freelancers near you
        </Link>
        <Link
          href="/jobs"
          className="inline-flex justify-center rounded-lg border border-transparent px-6 py-3 text-center text-sm font-semibold text-[#3525cd] hover:underline"
        >
          Start searching now
        </Link>
      </div>
    </div>
  );
}
