import type { Route } from "next";
import Link from "next/link";
import { REGISTER_CLIENT_POST_JOB } from "@/features/auth/lib/register-intents";

type JobsPublicEmptyProps = {
  /** True when user narrowed by category */
  categorySelected: boolean;
  /** True when any filter (keyword, city, mode, category) is active */
  hasFilters: boolean;
};

export function JobsPublicEmpty({ categorySelected, hasFilters }: JobsPublicEmptyProps) {
  if (categorySelected) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/70 px-6 py-14 text-center sm:px-10">
        <p className="text-lg font-semibold text-slate-900">No jobs yet in this category</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Nothing open matches that category right now. Try another category, clear filters, or check back as clients
          post new briefs.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/jobs"
            className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
          >
            Browse all open jobs
          </Link>
          <Link href={REGISTER_CLIENT_POST_JOB as Route} className="text-sm font-semibold text-[#3525cd] hover:underline">
            Post a job →
          </Link>
        </div>
      </div>
    );
  }

  if (hasFilters) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/70 px-6 py-14 text-center sm:px-10">
        <p className="text-lg font-semibold text-slate-900">No jobs match these filters</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Loosen the keyword, try another work mode, or remove the city—NearWork is early access and the board is
          still filling in.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/jobs"
            className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
          >
            Clear filters
          </Link>
          <Link href="/freelancers" className="text-sm font-semibold text-[#3525cd] hover:underline">
            Find freelancers instead →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/70 px-6 py-14 text-center sm:px-10">
      <p className="text-lg font-semibold text-slate-900">No open jobs yet</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
        The public board is empty for now. When clients post briefs—nearby shoots, remote edits, hybrid projects—they
        will show up here first.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <Link
          href={REGISTER_CLIENT_POST_JOB as Route}
          className="rounded-lg bg-[#3525cd] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f46e5]"
        >
          Post the first job
        </Link>
        <Link href="/freelancers" className="text-sm font-semibold text-[#3525cd] hover:underline">
          Browse freelancers →
        </Link>
      </div>
    </div>
  );
}
