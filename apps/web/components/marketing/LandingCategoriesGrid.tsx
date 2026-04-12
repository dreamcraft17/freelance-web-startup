import Link from "next/link";
import {
  Camera,
  GraduationCap,
  Palette,
  PenLine,
  TrendingUp,
  Video,
  Wrench
} from "lucide-react";

const categories = [
  { label: "Design", href: "/jobs", icon: Palette },
  { label: "Photo", href: "/jobs", icon: Camera },
  { label: "Video", href: "/jobs", icon: Video },
  { label: "Writing", href: "/jobs", icon: PenLine },
  { label: "Marketing", href: "/jobs", icon: TrendingUp },
  { label: "Tutoring", href: "/jobs", icon: GraduationCap },
  { label: "Local services", href: "/jobs", icon: Wrench }
] as const;

export function LandingCategoriesGrid() {
  return (
    <section className="bg-slate-100/80 px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 md:flex-row md:items-end">
          <div>
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Explore the marketplace</h2>
            <p className="max-w-xl text-slate-600">
              Talent across creative work, education, growth, and local services—not a dev-only job board.
            </p>
          </div>
          <Link
            href="/jobs"
            className="hidden items-center gap-1 text-sm font-semibold text-[#3525cd] transition hover:text-[#2d1fb0] md:inline-flex"
          >
            View all jobs
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {categories.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center outline outline-1 outline-slate-200/30 transition hover:border-[#3525cd]/40 hover:shadow-md"
            >
              <Icon
                className="mb-4 h-8 w-8 text-[#3525cd] transition-transform group-hover:scale-110"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="text-sm font-medium text-slate-800">{label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 md:hidden">
          <Link href="/jobs" className="text-sm font-semibold text-[#3525cd]">
            View all jobs →
          </Link>
        </div>
      </div>
    </section>
  );
}
