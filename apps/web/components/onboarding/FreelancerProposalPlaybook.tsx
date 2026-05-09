import type { LucideIcon } from "lucide-react";

export type FreelancerProposalPlaybookSection = {
  Icon: LucideIcon;
  title: string;
  body: string;
};

type Props = {
  title: string;
  intro: string;
  sections: FreelancerProposalPlaybookSection[];
  footerHint: string;
};

/** Structured proposal guidance — copy from server translations (EN/ID). */
export function FreelancerProposalPlaybook({ title, intro, sections, footerHint }: Props) {
  return (
    <section
      aria-label={title}
      className="rounded-3xl border border-[#3525cd]/14 bg-gradient-to-b from-[#faf9ff] via-white to-slate-50/30 p-6 shadow-[0_12px_40px_-34px_rgba(53,37,205,0.42)] md:p-7"
    >
      <div className="border-b border-slate-200/60 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{intro}</p>
      </div>
      <ul className="mt-5 space-y-5">
        {sections.map(({ Icon, title: st, body }, idx) => (
          <li key={`${idx}-${st}`} className="flex gap-4">
            <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#3525cd]/14 bg-[#3525cd]/10 text-[#3525cd] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-slate-900">{st}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">{footerHint}</p>
    </section>
  );
}
