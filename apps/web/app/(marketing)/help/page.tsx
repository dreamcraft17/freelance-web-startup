import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Help & contact</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          NearWork is a small team in early access. We do not run a 24/7 call center yet—here is how to get unstuck.
        </p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-base font-semibold text-slate-900">Before you write in</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <Link href="/how-it-works" className="font-medium text-[#3525cd] hover:underline">
                How it works
              </Link>{" "}
              covers client vs freelancer flows
            </li>
            <li>
              <Link href="/early-access" className="font-medium text-[#3525cd] hover:underline">
                Early access
              </Link>{" "}
              explains what is stable vs in progress
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-slate-900">Contact</h2>
          <p className="mt-2">
            For now, use the channel you already have with the team running this deployment (email or chat). A
            dedicated support inbox and ticketing will ship with the next wave of polish.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-slate-900">Trust</h2>
          <p className="mt-2">
            We take spam bids and scam patterns seriously. Report suspicious accounts when in-app reporting exists; until
            then, include screenshots if you reach out manually.
          </p>
        </section>
      </div>

      <p className="mt-10 text-xs text-slate-400">
        Legal drafts:{" "}
        <Link href="/privacy" className="text-[#3525cd] hover:underline">
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="text-[#3525cd] hover:underline">
          Terms
        </Link>
      </p>
    </div>
  );
}
