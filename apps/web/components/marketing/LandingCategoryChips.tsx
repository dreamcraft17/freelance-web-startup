import Link from "next/link";

const chips = [
  "Design",
  "Photography",
  "Video",
  "Tutor",
  "Marketing",
  "Local services"
] as const;

export function LandingCategoryChips() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-4 text-center sm:mt-24 sm:px-8">
      <div className="flex flex-wrap justify-center gap-3">
        {chips.map((label) => (
          <Link
            key={label}
            href="/jobs"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-[#464555] outline outline-1 outline-[#c7c4d8]/40 transition-colors hover:bg-indigo-100 hover:text-[#3323cc]"
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
