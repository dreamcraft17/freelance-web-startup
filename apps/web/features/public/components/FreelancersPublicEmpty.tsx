import Link from "next/link";

type FreelancersPublicEmptyProps = {
  categorySelected: boolean;
  hasFilters: boolean;
};

export function FreelancersPublicEmpty({ categorySelected, hasFilters }: FreelancersPublicEmptyProps) {
  if (categorySelected) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/70 px-6 py-14 text-center sm:px-10">
        <p className="text-lg font-semibold text-slate-900">No freelancers in this category yet</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Nobody on the directory lists skills under that category right now. Try another category, drop the filter, or
          widen your keyword.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/freelancers"
            className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
          >
            Browse everyone
          </Link>
          <Link href="/jobs" className="text-sm font-semibold text-[#3525cd] hover:underline">
            Find open jobs instead →
          </Link>
        </div>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/70 px-6 py-14 text-center sm:px-10">
        <p className="text-lg font-semibold text-slate-900">No freelancers match these filters</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Loosen the city, try remote-only, or shorten the keyword. The roster is still small in early access—clearing
          filters often helps.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/freelancers"
            className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
          >
            Reset filters
          </Link>
          <Link href="/jobs" className="text-sm font-semibold text-[#3525cd] hover:underline">
            View open jobs →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/70 px-6 py-14 text-center sm:px-10">
      <p className="text-lg font-semibold text-slate-900">The freelancer directory is still waking up</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
        No public profiles to show yet. When freelancers finish their NearWork profiles—especially city and work
        mode—they will appear here for nearby and remote discovery.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/freelancer/profile"
          className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
        >
          Create a freelancer profile
        </Link>
        <Link href="/jobs" className="text-sm font-semibold text-[#3525cd] hover:underline">
          Browse jobs →
        </Link>
      </div>
    </div>
  );
}
