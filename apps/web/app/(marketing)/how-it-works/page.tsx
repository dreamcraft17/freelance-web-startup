import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">How NearWork works</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          One marketplace for briefs, bids, and delivery—whether someone sits next to you in Jakarta or ships work
          from another time zone.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-indigo-900">For clients</h2>
        <ol className="mt-4 space-y-5 text-slate-700">
          <li>
            <span className="font-semibold text-slate-900">1. Post a brief</span>
            <p className="mt-1 text-sm leading-relaxed">
              Describe the outcome, budget, timeline, and whether you need someone{" "}
              <span className="font-medium">nearby</span>, <span className="font-medium">remote</span>, or{" "}
              <span className="font-medium">hybrid</span>. Location fields matter when the work is on-site.
            </p>
          </li>
          <li>
            <span className="font-semibold text-slate-900">2. Receive bids</span>
            <p className="mt-1 text-sm leading-relaxed">
              Freelancers respond with proposals tied to your job—compare in one thread instead of scattered DMs.
            </p>
          </li>
          <li>
            <span className="font-semibold text-slate-900">3. Hire and collaborate</span>
            <p className="mt-1 text-sm leading-relaxed">
              Pick who fits, align on milestones, and keep files and decisions where the work lives.
            </p>
          </li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-indigo-900">For freelancers</h2>
        <ol className="mt-4 space-y-5 text-slate-700">
          <li>
            <span className="font-semibold text-slate-900">1. Create your profile</span>
            <p className="mt-1 text-sm leading-relaxed">
              List skills, work mode, and where you can show up—so clients searching{" "}
              <span className="font-medium">nearby</span> can actually find you.
            </p>
          </li>
          <li>
            <span className="font-semibold text-slate-900">2. Browse jobs</span>
            <p className="mt-1 text-sm leading-relaxed">
              Filter public listings by city and mode. Early access means the board is still growing—check back often.
            </p>
          </li>
          <li>
            <span className="font-semibold text-slate-900">3. Submit bids</span>
            <p className="mt-1 text-sm leading-relaxed">
              Answer with clear scope, price, and timing. No boilerplate pitch farms—just real proposals.
            </p>
          </li>
        </ol>
      </section>

      <section className="rounded-2xl bg-indigo-50/80 px-5 py-6 text-sm leading-relaxed text-slate-700">
        <p className="font-semibold text-indigo-950">Nearby vs remote</p>
        <p className="mt-2">
          <span className="font-medium">Nearby</span> is for shoots, installs, lessons, and anything that needs a
          body in a place. <span className="font-medium">Remote</span> is for work that ships online. You can switch
          modes per job—NearWork keeps the brief honest either way.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/register"
          className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
        >
          Create an account
        </Link>
        <Link href="/jobs" className="text-sm font-semibold text-[#3525cd] hover:underline">
          Browse jobs →
        </Link>
      </div>
    </div>
  );
}
