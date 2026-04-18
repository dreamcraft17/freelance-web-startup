import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <header className="nw-page-header mb-8">
        <p className="nw-section-title">How it works</p>
        <h1 className="nw-page-title md:text-4xl">How NearWork works</h1>
        <p className="nw-page-description text-base leading-relaxed">
          NearWork connects clients and freelancers around <span className="font-medium text-slate-800">briefs</span>,{" "}
          <span className="font-medium text-slate-800">proposals</span>, and{" "}
          <span className="font-medium text-slate-800">delivery</span>
          —with your city and work mode in the loop when place matters. The product is real; the roadmap is still open.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="nw-surface p-6 sm:p-7">
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
              <p className="font-semibold text-slate-900">Receive proposals</p>
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

        <section className="nw-surface p-6 sm:p-7">
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
              <p className="font-semibold text-slate-900">Send proposals</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                Reply with clear scope, price, and timing. A strong proposal is specific to the brief—generic pitches do
                not help you or the client.
              </p>
            </li>
          </ol>
        </section>

        <section className="nw-surface-soft px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
          <h2 className="text-base font-semibold text-indigo-950">Nearby vs remote</h2>
          <p className="mt-3">
            <span className="font-medium text-slate-900">Nearby</span> fits shoots, installs, on-site support, and
            anything that needs someone in a place. <span className="font-medium text-slate-900">Remote</span> fits work
            that ships online. <span className="font-medium text-slate-900">Hybrid</span> sits in between. You pick the
            mode per job or per profile so expectations stay explicit.
          </p>
        </section>

        <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
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

      <section className="nw-surface mt-8 px-6 py-7 sm:px-8">
        <h2 className="text-xl font-semibold text-slate-900">Ready to try it?</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
          Create an account to post or bid, or explore the public board first—no hype, just the same product everyone
          else sees.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/register"
            className="nw-cta-primary inline-flex justify-center px-6 py-3"
          >
            Create an account
          </Link>
          <Link
            href="/jobs"
            className="inline-flex justify-center rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Browse open jobs
          </Link>
          <Link
            href="/freelancers"
            className="inline-flex justify-center px-1 py-3 text-sm font-semibold text-[#433C93] hover:underline"
          >
            Discover freelancers
          </Link>
        </div>
        <p className="mt-5 text-xs text-slate-500">
          Questions or rough edges?{" "}
          <Link href="/help" className="font-medium text-[#433C93] underline-offset-2 hover:underline">
            Help
          </Link>
        </p>
      </section>
    </div>
  );
}
