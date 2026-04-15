import Link from "next/link";

export function LandingFinalCta() {
  return (
    <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
      <div className="nw-surface flex flex-col gap-6 p-5 sm:p-7">
        <div>
          <p className="nw-section-title">Start using the product</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Browse first, then sign up when you are ready
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Early access stays practical: real listings, no fake urgency, and clear flows for both clients and freelancers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/freelancers" className="nw-cta-primary">
            Find freelancers
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Browse jobs
          </Link>
          <Link href="/register" className="text-sm font-semibold text-[#433C93] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}
