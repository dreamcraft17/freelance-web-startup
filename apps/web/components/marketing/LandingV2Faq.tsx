"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_KEYS = [
  { q: "landing.v2.faq.q1", a: "landing.v2.faq.a1" },
  { q: "landing.v2.faq.q2", a: "landing.v2.faq.a2" },
  { q: "landing.v2.faq.q3", a: "landing.v2.faq.a3" },
  { q: "landing.v2.faq.q4", a: "landing.v2.faq.a4" }
] as const;

/** Client FAQ accordion — copy injected from server wrapper or defaults. */
export function LandingV2Faq({
  items = FAQ_KEYS.map((k) => ({ questionKey: k.q, answerKey: k.a }))
}: {
  items?: { questionKey: string; answerKey: string; question?: string; answer?: string }[];
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const open = openIdx === idx;
        const question = item.question ?? item.questionKey;
        const answer = item.answer ?? item.answerKey;
        return (
          <div key={item.questionKey} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={open}
              onClick={() => setOpenIdx(open ? null : idx)}
            >
              {question}
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
            </button>
            {open && <p className="border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-600">{answer}</p>}
          </div>
        );
      })}
    </div>
  );
}

/** Server-friendly FAQ with translated strings */
export function LandingV2FaqTranslated({
  items
}: {
  items: { question: string; answer: string; questionKey: string; answerKey: string }[];
}) {
  return <LandingV2Faq items={items} />;
}
