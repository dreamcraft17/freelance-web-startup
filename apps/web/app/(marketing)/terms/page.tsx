import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Terms of service</h1>
        <p className="mt-3 text-sm text-slate-600">
          Draft placeholder for early access. Replace with counsel-reviewed terms before charging money at scale.
        </p>
      </header>
      <div className="max-w-none text-sm leading-relaxed text-slate-700">
        <p>
          By using NearWork during early access you agree to use the product responsibly: no fraudulent listings, no
          harassment, and no attempts to bypass platform safety controls we add over time.
        </p>
        <p className="mt-4">
          Payments and dispute resolution may rely on third-party providers; final legal language will describe those
          relationships clearly.
        </p>
        <p className="mt-4">
          Questions?{" "}
          <Link href="/help" className="font-semibold text-[#3525cd] hover:underline">
            Help & contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
