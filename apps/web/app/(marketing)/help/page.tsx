import Link from "next/link";

const helpTopics = [
  {
    title: "Getting started",
    blurb: "Creating an account, roles (client vs freelancer), and what you can do in early access."
  },
  {
    title: "Jobs and bids",
    blurb: "Posting a brief, reviewing proposals, and what happens after you pick someone."
  },
  {
    title: "Profiles and discovery",
    blurb: "City, work mode, and how you show up to clients searching nearby or remote."
  },
  {
    title: "Payments and payouts",
    blurb: "Placeholder topic—full guidance will land when checkout and payouts are wired end to end."
  },
  {
    title: "Something broken or unsafe",
    blurb: "Errors, abuse, or scam patterns—reach out with what you saw and when; screenshots help."
  }
] as const;

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Help</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Help & contact</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          NearWork is a small product in early access. We are not a 24/7 support desk yet—this page is a honest anchor
          for how to reach us and what we can help with.
        </p>
      </header>

      <section className="mb-10 rounded-2xl bg-white/90 p-6 shadow-[0_2px_20px_-4px_rgba(53,37,205,0.08)] ring-1 ring-slate-200/60 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Contact / support</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          For questions, bugs, or trust and safety reports, email us at the address below. We read everything; response
          time depends on volume while the team is small.
        </p>
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 ring-1 ring-slate-200/80">
          support@nearwork.example
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Placeholder—replace with your real support inbox before you point customers here.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-slate-900">Help topics (outline)</h2>
        <p className="mt-2 text-sm text-slate-600">
          Full articles can live here later; for now these are the buckets we expect to document.
        </p>
        <ul className="mt-5 space-y-4">
          {helpTopics.map((t) => (
            <li
              key={t.title}
              className="rounded-xl border border-slate-200/90 bg-white/60 px-4 py-3 text-sm text-slate-700"
            >
              <span className="font-semibold text-slate-900">{t.title}</span>
              <span className="mt-1 block leading-relaxed text-slate-600">{t.blurb}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/80 px-5 py-6 text-sm leading-relaxed text-slate-700 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">Self-serve first</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5">
          <li>
            <Link href="/how-it-works" className="font-medium text-[#3525cd] hover:underline">
              How it works
            </Link>{" "}
            — client and freelancer flows
          </li>
          <li>
            <Link href="/early-access" className="font-medium text-[#3525cd] hover:underline">
              Early access
            </Link>{" "}
            — what works today vs what is still moving
          </li>
          <li>
            <Link href="/pricing" className="font-medium text-[#3525cd] hover:underline">
              Pricing
            </Link>{" "}
            — free during early access; donations optional
          </li>
        </ul>
      </section>

      <p className="mt-10 text-xs text-slate-400">
        <Link href="/privacy" className="text-[#3525cd] hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="text-[#3525cd] hover:underline">
          Terms
        </Link>
      </p>
    </div>
  );
}
