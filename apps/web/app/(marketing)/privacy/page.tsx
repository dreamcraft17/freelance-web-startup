import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Privacy policy</h1>
        <p className="mt-3 text-sm text-slate-600">
          Draft placeholder for early access. Replace with counsel-reviewed text before production marketing.
        </p>
      </header>
      <div className="max-w-none text-sm leading-relaxed text-slate-700">
        <p>
          NearWork processes account data (email, name, role) and content you post (jobs, bids, messages) to run the
          marketplace. We use cookies for signed-in sessions. We do not sell personal data to third parties in this
          early-access build.
        </p>
        <p className="mt-4">
          For questions, use{" "}
          <Link href="/help" className="font-semibold text-[#3525cd] hover:underline">
            Help & contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
