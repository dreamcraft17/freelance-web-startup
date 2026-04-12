import Link from "next/link";

export function LandingFinalCta() {
  return (
    <section className="px-4 pb-20 pt-4 sm:px-6 sm:pb-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#3525cd] to-indigo-600 px-8 py-16 text-center text-white sm:px-12 sm:py-20 md:rounded-[3rem] md:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden>
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="nw-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#nw-grid)" />
          </svg>
        </div>
        <div className="relative z-10">
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Start hiring or get hired today
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-indigo-100 md:text-xl">
            Open a workspace to post and track work, or browse jobs and freelancers first—you choose when to commit.
          </p>
          <Link
            href="/register"
            className="inline-flex rounded-2xl bg-white px-10 py-4 text-lg font-bold text-[#3525cd] shadow-lg transition hover:bg-indigo-50 active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
