/**
 * Lightweight completeness heuristic for structured proposal cover letters.
 * Tolerates older letters without labeled sections.
 */

export type CoverLetterCompleteness = {
  /** 0–100 */
  pct: number;
  /** Structured blocks detected as adequately filled */
  sections: Partial<Record<"intro" | "experience" | "approach" | "timeline", boolean>>;
};

const MIN_RUN = 18;

function sliceAfterHeader(text: string, headerRegex: RegExp): string | null {
  const m = text.match(headerRegex);
  if (!m || m.index == null) return null;
  const start = m.index + m[0].length;
  let body = text.slice(start);
  /** Stop at next major section heading (capitalized words + colon at line start). */
  const next = body.search(/\n(?=[A-Za-z][A-Za-z &/\-]{2,42}:)/);
  if (next !== -1) body = body.slice(0, next);
  return body.trim();
}

function nonempty(s: string | null): s is string {
  return Boolean(s && s.trim().replace(/\s+/g, " ").length >= MIN_RUN);
}

export function analyzeCoverLetterCompleteness(raw: string | null | undefined): CoverLetterCompleteness {
  const text = (raw ?? "").trim();
  if (!text) {
    return { pct: 0, sections: {} };
  }

  const intro = sliceAfterHeader(text, /(?:^|\n)Intro:\s*\n/i);
  const experience = sliceAfterHeader(text, /(?:^|\n)(?:Relevant experience|Experience):\s*\n/i);
  const approach = sliceAfterHeader(text, /(?:^|\n)Approach:\s*\n/i);
  const timeline = sliceAfterHeader(text, /(?:^|\n)Timeline(?:\s*(?:\/|&|and)\s*availability|\s*&\s*availability)?\s*:\s*\n/i);

  const sections: CoverLetterCompleteness["sections"] = {
    intro: nonempty(intro),
    experience: nonempty(experience),
    approach: nonempty(approach),
    timeline: nonempty(timeline)
  };

  const filled = Object.values(sections).filter(Boolean).length;
  const hasAnyHeader =
    /(?:^|\n)Intro:\s*\n/i.test(text) ||
    /(?:^|\n)(?:Relevant experience|Experience):\s*\n/i.test(text) ||
    /(?:^|\n)Approach:\s*\n/i.test(text) ||
    /(?:^|\n)Timeline[^\n:]*:\s*\n/i.test(text);

  if (!hasAnyHeader) {
    const len = text.length;
    const pct =
      len >= 400 ? 80 : len >= 220 ? 65 : len >= 120 ? 50 : len >= 60 ? 35 : Math.max(10, Math.min(30, Math.floor(len / 3)));
    return { pct: Math.min(100, pct), sections: {} };
  }

  return { pct: Math.round((filled / 4) * 100), sections };
}
