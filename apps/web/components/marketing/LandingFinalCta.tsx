import Link from "next/link";

export function LandingFinalCta() {
  return (
    <section className="mt-16 px-4 sm:mt-24 sm:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#3525cd] px-7 py-12 text-left text-white shadow-xl sm:rounded-[2.5rem] sm:px-10 sm:py-14 md:px-14 md:py-16 lg:rounded-r-[3rem] lg:rounded-tl-[2rem]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-400/15 blur-2xl"
          aria-hidden
        />

        <div className="relative z-10 max-w-xl">
          <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Start local, go remote if you want—same place.
          </h2>
          <p className="mb-8 text-base leading-relaxed text-indigo-100 sm:text-lg">
            Early access is free—browse first, post when you have a budget. We are not here to flood you with generic
            pitches.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/freelancers"
              className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#3525cd] shadow-lg transition hover:bg-indigo-50 sm:text-base"
            >
              Find freelancers near you
            </Link>
            <Link
              href="/jobs"
              className="inline-flex w-fit items-center justify-center rounded-xl border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:text-base"
            >
              Browse open jobs
            </Link>
            <Link
              href="/register"
              className="inline-flex w-fit items-center justify-center rounded-xl border border-transparent px-6 py-3.5 text-sm font-semibold text-indigo-100 underline-offset-4 transition hover:text-white hover:underline sm:text-base"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
