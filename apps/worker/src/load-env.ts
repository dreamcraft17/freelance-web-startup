/**
 * Worker runs with cwd `apps/worker`; Next.js loads `apps/web/.env.local` automatically,
 * but this process does not. Load monorepo root env so `DATABASE_URL` matches the web app.
 */
import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(process.cwd(), "../..");
for (const name of [".env.local", ".env"] as const) {
  const p = resolve(repoRoot, name);
  if (existsSync(p)) {
    config({ path: p });
  }
}
