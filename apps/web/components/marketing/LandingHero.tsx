import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Search } from "lucide-react";

export function LandingHero() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-8 text-center sm:px-8 sm:pb-20 sm:pt-10">
      <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#3f465c]">
        <BadgeCheck className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
        Currently in early access
      </div>

      <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-[#191c1e] sm:text-5xl md:text-6xl lg:text-6xl">
        Find nearby or remote freelancers{" "}
        <span className="font-medium italic text-[#3525cd]">without the hassle</span>
      </h1>

      <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#464555] sm:text-xl">
        From photographers to designers to local services—all in one place. We are simplifying how talent connects
        with opportunity.
      </p>

      <form
        action="/freelancers"
        method="get"
        className="mb-8 flex w-full max-w-3xl flex-col items-stretch gap-2 rounded-xl bg-white p-2 shadow-[0_25px_50px_-12px_rgba(53,37,205,0.12)] outline outline-1 outline-[#c7c4d8]/30 sm:flex-row sm:items-center"
      >
        <label className="flex flex-1 cursor-text items-center gap-3 border-b border-[#c7c4d8]/25 px-4 py-3 sm:border-b-0 sm:border-r sm:py-2">
          <span className="sr-only">Search</span>
          <Search className="h-5 w-5 shrink-0 text-[#777587]" aria-hidden />
          <input
            name="q"
            type="search"
            placeholder="Search services…"
            className="min-w-0 flex-1 border-0 bg-transparent text-base text-[#191c1e] placeholder:text-[#777587] focus:outline-none focus:ring-0"
            autoComplete="off"
          />
        </label>
        <label className="flex flex-1 cursor-text items-center gap-3 px-4 py-3 sm:py-2">
          <span className="sr-only">City</span>
          <MapPin className="h-5 w-5 shrink-0 text-[#777587]" aria-hidden />
          <input
            name="city"
            type="text"
            placeholder="City"
            className="min-w-0 flex-1 border-0 bg-transparent text-base text-[#191c1e] placeholder:text-[#777587] focus:outline-none focus:ring-0"
            autoComplete="address-level2"
          />
        </label>
        <button
          type="submit"
          className="w-full shrink-0 rounded-lg bg-[#3525cd] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#4f46e5] active:scale-[0.98] sm:w-auto"
        >
          Find freelancers
        </button>
      </form>

      <Link
        href="/register"
        className="group inline-flex items-center gap-1 font-semibold text-[#3525cd] transition hover:underline"
      >
        Post a job free
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </Link>
    </section>
  );
}
