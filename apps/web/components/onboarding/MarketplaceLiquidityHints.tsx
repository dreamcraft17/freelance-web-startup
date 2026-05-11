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
      className="nw-card rounded-3xl border-slate-200/82 bg-gradient-to-b from-[#faf9ff] to-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] md:px-5 md:py-5"
    >
      <h2 className="nw-type-section text-slate-900">{title}</h2>
      <p className="nw-type-body mt-1.5">{intro}</p>
      <ul className="mt-2.5 space-y-2 text-[12px] leading-relaxed text-slate-700 md:text-[13px]">
        {bullets.map((line, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#3525cd]" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {footer ? <div className="nw-type-meta mt-2.5 normal-case tracking-normal">{footer}</div> : null}
    </section>
  );
}
