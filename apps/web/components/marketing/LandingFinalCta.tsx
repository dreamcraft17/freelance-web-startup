import Link from "next/link";

export function LandingFinalCta() {
  return (
    <section className="mt-20 px-4 sm:mt-32 sm:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-[#3525cd] px-8 py-14 text-center text-white shadow-xl sm:rounded-[3rem] sm:px-12 sm:py-16 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden>
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="nw-cta-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#nw-cta-grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          <h2 className="mb-5 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Be one of the first to try NearWork.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg opacity-90 sm:text-xl">
            We are building a simpler way to hire. Join a calmer marketplace for transparent, accessible freelance
            connections.
          </p>
          <Link
            href="/register"
            className="inline-flex rounded-xl bg-white px-10 py-4 text-lg font-bold text-[#3525cd] shadow-xl transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Start exploring NearWork
          </Link>
        </div>
      </div>
    </section>
  );
}
