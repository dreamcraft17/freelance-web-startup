import Link from "next/link";

const chips: { label: string; variant: "solid" | "soft" | "outline" }[] = [
  { label: "Design", variant: "solid" },
  { label: "Photography", variant: "soft" },
  { label: "Video", variant: "outline" },
  { label: "Tutor", variant: "solid" },
  { label: "Marketing", variant: "soft" },
  { label: "Local services", variant: "outline" }
];

const chipClass: Record<(typeof chips)[number]["variant"], string> = {
  solid: "border-transparent bg-slate-800 text-white hover:bg-slate-700",
  soft: "border-transparent bg-indigo-100/90 text-indigo-950 hover:bg-indigo-200/90",
  outline: "border border-slate-200/80 bg-white text-[#464555] hover:border-indigo-200 hover:bg-indigo-50/80"
};

export function LandingCategoryChips() {
  return (
    <section className="mx-auto mt-14 max-w-7xl px-4 sm:mt-20 sm:px-8">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
        Open roles · often hired on-site or hybrid
      </p>
      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
        {chips.map(({ label, variant }) => (
          <Link
            key={label}
            href="/jobs"
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${chipClass[variant]}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
