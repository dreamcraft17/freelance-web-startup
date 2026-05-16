import { describe, expect, it } from "vitest";
import en from "../../locales/en.json";
import id from "../../locales/id.json";

/** Spot-check that English marketing hero strings are not Indonesian copy. */
const ID_MARKERS = [/lowongan/i, /Pasang lowongan/i, /Saya ingin rekrut/i, /Semua kategori/i, /Siap bekerja/i, /Jelajahi/i];

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectStrings(v, out);
    }
  }
}

describe("locale dictionaries — marketing EN/ID split", () => {
  it("English landing.hero strings avoid common Indonesian marketplace phrases", () => {
    const hero = (en as { landing?: { hero?: unknown } }).landing?.hero;
    expect(hero).toBeDefined();
    const strings: string[] = [];
    collectStrings(hero, strings);
    expect(strings.length).toBeGreaterThan(10);
    for (const s of strings) {
      for (const re of ID_MARKERS) {
        expect(s).not.toMatch(re);
      }
    }
  });

  it("Indonesian landing.hero retains Indonesian hire headline lead", () => {
    const line = id.landing.hero.hire.headlineLine1;
    expect(line).toMatch(/freelancer/i);
    expect(line.length).toBeGreaterThan(5);
  });

  it("English jobs browse dictionary avoids Indonesian-only job board title words", () => {
    const title = en.public.jobs.pageTitle;
    expect(title).not.toMatch(/lowongan/i);
    expect(title.length).toBeGreaterThan(3);
  });

  it("Indonesian jobs browse dictionary uses Indonesian section title", () => {
    expect(id.public.jobs.sectionTitle).toMatch(/lowongan/i);
  });
});
