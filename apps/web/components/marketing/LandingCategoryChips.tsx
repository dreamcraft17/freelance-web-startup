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
  solid: "border-slate-900/10 bg-slate-900 text-white hover:bg-slate-800",
  soft: "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200",
  outline: "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
};

export function LandingCategoryChips() {
  return (
    <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
        Open roles · often hired on-site or hybrid
      </p>
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {chips.map(({ label, variant }) => (
          <Link
            key={label}
            href="/jobs"
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${chipClass[variant]}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
