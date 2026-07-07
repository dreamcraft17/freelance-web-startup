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
      className="nw-card-trust rounded-xl p-5 md:p-6"
    >
      <div className="border-b border-slate-200/60 pb-4">
        <h2 className="nw-type-title text-slate-900">{title}</h2>
        <p className="nw-type-body mt-1.5">{intro}</p>
      </div>
      <ul className="mt-4 space-y-4">
        {sections.map(({ Icon, title: st, body }, idx) => (
          <li key={`${idx}-${st}`} className="flex gap-3.5">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-nw-brand/15 bg-nw-brand/10 text-nw-brand">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-[14px] font-semibold text-slate-900">{st}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{body}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="nw-type-meta mt-4 border-t border-slate-100 pt-3.5 normal-case tracking-normal">{footerHint}</p>
    </section>
  );
}
