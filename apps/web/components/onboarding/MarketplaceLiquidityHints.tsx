import type { ReactNode } from "react";

type Props = {
  title: string;
  intro: string;
  bullets: string[];
  footer?: ReactNode;
};

/** Practical liquidity guidance — no fabricated metrics; copy from caller (localized). */
export function MarketplaceLiquidityHints({ title, intro, bullets, footer }: Props) {
  return (
    <section
      aria-label={title}
      className="rounded-xl border border-slate-200/90 bg-[#faf9ff]/80 px-4 py-4 md:px-5 md:py-5"
    >
      <h2 className="text-sm font-semibold leading-snug text-slate-900">{title}</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-600 md:text-[13px]">{intro}</p>
      <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700 md:text-[13px]">
        {bullets.map((line, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#3525cd]" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {footer ? <div className="mt-3 text-xs leading-relaxed text-slate-500">{footer}</div> : null}
    </section>
  );
}
