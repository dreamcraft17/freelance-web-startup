/**
 * Run marketplace HTTP e2e against a fresh production server (avoids flaky webpack chunks from `next dev`).
 *
 * Env:
 *   - E2E_PORT (default 3041)
 *   - SKIP_E2E_BUILD=1  skip `pnpm --filter @acme/web build` when `.next` is already trustworthy
 *   - **`DATABASE_URL_TEST` (recommended)** — isolated Postgres for automation; when set, the runner **overrides `DATABASE_URL`** for build + `next start` so you never hit staging/prod by mistake.
 *   - `DATABASE_URL`, `SESSION_SECRET` (>=16) — required when `DATABASE_URL_TEST` is unset (same as manual dev)
 *
 * Usage: `node scripts/run-e2e-server.mjs` (invoked by root `pnpm test:e2e`)
 */

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = String(Number(process.env.E2E_PORT ?? "3041") || 3041);
const baseUrl = `http://127.0.0.1:${port}`;

/** Prefer disposable test DB URL so CI/local e2e never inherits a public staging `DATABASE_URL`. */
function e2eProcessEnv() {
  const testDb = process.env.DATABASE_URL_TEST?.trim();
  if (!testDb) return { ...process.env };
  if (process.env.E2E_DEBUG_SERVER === "1") {
    console.warn("[e2e] DATABASE_URL_TEST is set — using it as DATABASE_URL for build + server");
  }
  return { ...process.env, DATABASE_URL: testDb };
}

function run(command, args, opts = {}) {
  const { env: envExtra, ...spawnRest } = opts;
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      env: envExtra ? { ...process.env, ...envExtra } : process.env,
      ...spawnRest
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal || code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} exited ${code ?? "null"} (${signal ?? ""})`));
      } else {
        resolve();
      }
    });
  });
}

async function waitForJsonCsrf(base, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${base}/api/auth/csrf`, {
        headers: { Accept: "application/json" }
      });
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("application/json")) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      await res.json().catch(() => null);
      return;
    } catch {
      /* server still booting */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`E2E: server not JSON-ready at ${base}/api/auth/csrf within ${timeoutMs}ms`);
}

async function main() {
  const childEnv = e2eProcessEnv();
  if (!childEnv.DATABASE_URL?.trim()) {
    throw new Error(
      "E2E requires DATABASE_URL (or DATABASE_URL_TEST pointing at an isolated Postgres). Never use production or shared public staging."
    );
  }

  if (!process.env.SKIP_E2E_BUILD) {
    await run("pnpm", ["--filter", "@acme/web", "build"], { env: childEnv });
  }

  /** @type {import('node:child_process').ChildProcessWithoutNullStreams | undefined} */
  let srv;
  try {
    srv = spawn("pnpm", ["--filter", "@acme/web", "exec", "next", "start", "-p", port, "-H", "127.0.0.1"], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: childEnv
    });

    srv.stdout?.on("data", (c) => {
      if (process.env.E2E_DEBUG_SERVER === "1") process.stdout.write(c);
    });
    srv.stderr?.on("data", (c) => {
      if (process.env.E2E_DEBUG_SERVER === "1") process.stderr.write(c);
    });

    await waitForJsonCsrf(baseUrl);

    await run("node", ["--test", "scripts/e2e-marketplace-flow.mjs"], {
      env: { ...process.env, BASE_URL: baseUrl }
    });
  } finally {
    if (srv?.pid) {
      srv.kill("SIGTERM");
      await new Promise((r) => setTimeout(r, 1500));
      if (!srv.killed) {
        srv.kill("SIGKILL");
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
