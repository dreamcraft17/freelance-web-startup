import type { ReactNode } from "react";

export function AdminPageIntro({
  title,
  description,
  badge
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <header className="mb-4 border-b border-slate-200/80 pb-4">
      {badge ? (
        <p className="mb-2 inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-700">
          {badge}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p>
    </header>
  );
}

export function AdminStatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function AdminStatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </article>
  );
}

export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-3.5">{children}</div>
    </section>
  );
}

export function AdminEmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{copy}</p>
    </div>
  );
}

