import { describe, expect, it } from "vitest";
import { SearchService } from "./search.service";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());
const httpBase = process.env.E2E_BASE_URL?.replace(/\/$/, "").trim();

/**
 * DB integration guards raw SQL composition (filters + join) against P2010 / invalid placeholders.
 * Skips without DATABASE_URL (typical CI). Set E2E_BASE_URL (e.g. http://127.0.0.1:3000) for an extra
 * HTTP smoke on GET /api/jobs while a Next server is running. Full create→list regression: `pnpm test:e2e`.
 */
describe.runIf(hasDb)("SearchService job listing (integration)", () => {
  it("listPublicOpenJobsPaginated returns 200-shaped data without raw WHERE/jsonb failure", async () => {
    const svc = new SearchService();
    const emptyKeyword = await svc.listPublicOpenJobsPaginated({ page: 1, limit: 5 });
    expect(emptyKeyword.total).toBeGreaterThanOrEqual(0);
    expect(emptyKeyword.items.length).toBeLessThanOrEqual(5);

    const withKeyword = await svc.listPublicOpenJobsPaginated({ page: 1, limit: 5, keyword: "test" });
    expect(withKeyword.total).toBeGreaterThanOrEqual(0);

    await expect(svc.searchFreelancers({ page: 1, limit: 3 })).resolves.toMatchObject({
      total: expect.any(Number),
      items: expect.any(Array)
    });
  });
});

describe.runIf(Boolean(httpBase))("GET /api/jobs HTTP smoke (optional)", () => {
  it("returns 200 with list payload shape", async () => {
    const res = await fetch(`${httpBase}/api/jobs?page=1&limit=10`);
    expect(res.status, await res.text()).toBe(200);
    const body = (await res.json()) as { success?: boolean; data?: { items: unknown[]; total: number } };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data?.items)).toBe(true);
    expect(typeof body.data?.total).toBe("number");
  });
});
