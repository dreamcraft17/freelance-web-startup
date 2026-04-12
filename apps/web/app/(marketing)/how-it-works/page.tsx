import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">How it works</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">How NearWork works</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          NearWork connects clients and freelancers around <span className="font-medium text-slate-800">briefs</span>,{" "}
          <span className="font-medium text-slate-800">bids</span>, and <span className="font-medium text-slate-800">delivery</span>
          —with your city and work mode in the loop when place matters. The product is real; the roadmap is still open.
        </p>
      </header>

      <div className="space-y-10">
        <section className="rounded-2xl bg-white/90 p-6 shadow-[0_2px_20px_-4px_rgba(53,37,205,0.08)] ring-1 ring-slate-200/60 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">For clients</h2>
          <p className="mt-1 text-sm text-slate-600">When you need talent for a defined piece of work.</p>
          <ol className="mt-6 space-y-6">
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">Post a brief</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                Describe the outcome, budget, and timeline. Say whether you need someone{" "}
                <span className="font-medium">nearby</span>, <span className="font-medium">remote</span>, or{" "}
                <span className="font-medium">hybrid</span>—clients use location fields when the work is not only online.
              </p>
            </li>
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">Receive bids</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                Freelancers respond with proposals on your job. You compare scope, price, and timing in one place instead
                of scattered threads.
              </p>
            </li>
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">Hire and collaborate</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                Choose who fits, align on milestones, and keep decisions next to the work. The details depend on your
                project—NearWork is the shared starting line, not a replacement for how you run delivery day to day.
              </p>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl bg-white/90 p-6 shadow-[0_2px_20px_-4px_rgba(53,37,205,0.08)] ring-1 ring-slate-200/60 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">For freelancers</h2>
          <p className="mt-1 text-sm text-slate-600">When you want briefs that respect how and where you work.</p>
          <ol className="mt-6 space-y-6">
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">Create a profile</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                Add skills, work mode, and where you can show up in person. That helps clients who care about{" "}
                <span className="font-medium">nearby</span> talent actually discover you—not just your headline.
              </p>
            </li>
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">Browse jobs</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                Use the public job board and filters (including city and mode) to find briefs that match how you work.
                Listings are live data from the marketplace—not a demo feed.
              </p>
            </li>
            <li className="border-l-2 border-indigo-200 pl-4">
              <p className="font-semibold text-slate-900">Submit bids</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                Reply with clear scope, price, and timing. A good bid is specific to the brief—generic pitches do not
                help you or the client.
              </p>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl bg-indigo-50/70 px-5 py-6 text-sm leading-relaxed text-slate-700 ring-1 ring-indigo-100 sm:px-6">
          <h2 className="text-base font-semibold text-indigo-950">Nearby vs remote</h2>
          <p className="mt-3">
            <span className="font-medium text-slate-900">Nearby</span> fits shoots, installs, on-site support, and
            anything that needs someone in a place. <span className="font-medium text-slate-900">Remote</span> fits work
            that ships online. <span className="font-medium text-slate-900">Hybrid</span> sits in between. You pick the
            mode per job or per profile so expectations stay explicit.
          </p>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/80 px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">Early access</h2>
          <p className="mt-3">
            NearWork is still in early access: features and coverage will grow, and some flows will change as we learn
            from real usage. We are not pretending the marketplace is “complete”—we are inviting people who are okay
            building with us.
          </p>
          <p className="mt-3">
            <Link href="/early-access" className="font-semibold text-[#3525cd] hover:underline">
              Read what early access means today →
            </Link>
          </p>
        </section>
      </div>

      <section className="mt-14 rounded-2xl bg-[#3525cd] px-6 py-10 text-center sm:px-10">
        <h2 className="text-xl font-semibold text-white">Ready to try it?</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-indigo-100">
          Create an account to post or bid, or explore the public board first—no hype, just the same product everyone
          else sees.
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
            Browse open jobs
          </Link>
          <Link
            href="/freelancers"
            className="inline-flex justify-center rounded-lg border border-transparent px-6 py-3 text-sm font-semibold text-white hover:underline"
          >
            Discover freelancers
          </Link>
        </div>
        <p className="mt-6 text-xs text-indigo-200/90">
          Questions or rough edges?{" "}
          <Link href="/help" className="font-medium text-white underline-offset-2 hover:underline">
            Help
          </Link>
        </p>
      </section>
    </div>
  );
}
