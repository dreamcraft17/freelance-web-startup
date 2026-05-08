/**
 * End-to-end marketplace flow (HTTP against a running Next app).
 *
 * Prerequisites:
 *   - `DATABASE_URL`, `SESSION_SECRET` (>=16 chars) set for the web app
 *   - Migrations applied: `pnpm db:migrate`
 *   - Seeded admin (`pnpm db:seed`): defaults `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` for `/api/admin/reports` assertion
 *   - Web dev or prod server: `pnpm --filter @acme/web dev` (default base http://127.0.0.1:3000)
 *
 * Covers a second path — pre-hire discussion: client creates job, freelancer bids, client opens JOB thread (`POST /api/messages` with CSRF) and sends a message before hiring.
 *
 * Run: `pnpm test:e2e` or `node --test scripts/e2e-marketplace-flow.mjs`
 *
 * Optional manual smoke after trust changes: authenticated user POST `/api/reports`
 * with CSRF cookie/header (job/thread/etc.) → staff triage `/admin/reports`.
 * Override base URL: `BASE_URL=http://localhost:3000 pnpm test:e2e`
 *
 * If you see "redirect count exceeded" or "Redirect cycle", use 127.0.0.1 (default) or the exact
 * host shown in the Next dev banner; avoid http↔https or localhost↔127.0.0.1 mismatch loops.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

const BASE_URL = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const SESSION = "acme_session";
const NW_CSRF_HEADER = "X-CSRF-Token";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/**
 * Undici "redirect: follow" can hit the default redirect cap if something bounces between hosts
 * (e.g. localhost ↔ 127.0.0.1). Follow manually with a small hop limit and cycle detection.
 */
async function fetchWithRedirects(url, init, { maxHops = 15 } = {}) {
  let currentUrl = url;
  let method = init.method ?? "GET";
  let body = init.body;
  const headers = new Headers(init.headers ?? {});
  const chain = [];

  for (let hop = 0; hop < maxHops; hop++) {
    if (chain.includes(currentUrl)) {
      throw new Error(
        `Redirect cycle (hop ${hop}): ${chain.join(" → ")} → ${currentUrl}. ` +
          `Set BASE_URL to the same origin Next prints (try http://127.0.0.1:3000).`
      );
    }
    chain.push(currentUrl);

    const res = await fetch(currentUrl, {
      method,
      headers,
      body,
      redirect: "manual"
    });

    if (REDIRECT_STATUSES.has(res.status)) {
      const loc = res.headers.get("location");
      if (!loc) {
        throw new Error(`HTTP ${res.status} from ${currentUrl} without Location header`);
      }
      currentUrl = new URL(loc, currentUrl).href;

      // 301/302/303: many clients drop POST body on redirect (not 307/308).
      if (res.status === 303 || res.status === 302 || res.status === 301) {
        method = "GET";
        body = undefined;
        headers.delete("Content-Type");
      }
      continue;
    }

    return res;
  }

  throw new Error(`Too many redirects (>${maxHops}). Chain started at ${url}: ${chain.join(" → ")}`);
}

function getSetCookieLines(res) {
  if (typeof res.headers.getSetCookie === "function") {
    return res.headers.getSetCookie();
  }
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

/** Returns `acme_session=...` value for the Cookie request header (no attributes). */
function sessionCookiePairFromResponse(res) {
  for (const line of getSetCookieLines(res)) {
    const [pair] = line.split(";");
    if (pair?.startsWith(`${SESSION}=`)) {
      return pair.trim();
    }
  }
  return null;
}

/** `{name}=value` pair from Set-Cookie (no attributes). */
function namedCookiePairFromResponse(res, name) {
  for (const line of getSetCookieLines(res)) {
    const [pair] = line.split(";");
    const p = pair?.trim();
    if (p?.startsWith(`${name}=`)) return p;
  }
  return null;
}

function mergeCookiePairs(a, b) {
  if (!a) return b ?? "";
  if (!b) return a;
  return `${a}; ${b}`;
}

async function postWithCsrf(path, cookieSessionPair, jsonBody) {
  const csrfRes = await fetchWithRedirects(`${BASE_URL}/api/auth/csrf`, {
    method: "GET",
    headers: { Accept: "application/json", Cookie: cookieSessionPair }
  });
  const { body: csrfBody } = await readJson(csrfRes);
  if (csrfRes.status !== 200) {
    throw new Error(`csrf mint failed ${csrfRes.status}: ${JSON.stringify(csrfBody)}`);
  }
  const csrfToken = csrfBody.data?.csrfToken;
  const csrfPair = namedCookiePairFromResponse(csrfRes, "acme_csrf");
  if (!csrfToken || !csrfPair) {
    throw new Error(`missing csrf (${csrfRes.status}) body=${JSON.stringify(csrfBody)}`);
  }
  const merged = mergeCookiePairs(cookieSessionPair, csrfPair);
  const res = await fetchWithRedirects(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: merged,
      [NW_CSRF_HEADER]: csrfToken,
      Origin: new URL(BASE_URL).origin
    },
    body: JSON.stringify(jsonBody)
  });
  const { body } = await readJson(res);
  return { res, body };
}

async function readJson(res) {
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Non-JSON response ${res.status}: ${text.slice(0, 200)}`);
  }
  return { body, text };
}

async function api(path, { method = "GET", cookie = null, json = undefined } = {}) {
  const headers = { Accept: "application/json" };
  if (cookie) headers.Cookie = cookie;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetchWithRedirects(`${BASE_URL}${path}`, {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined
  });
  const { body } = await readJson(res);
  return { res, body };
}

test("full marketplace flow (register → reviews & aggregates)", async () => {
  const suffix = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  const clientEmail = `e2e_client_${suffix}@example.com`;
  const freelancerEmail = `e2e_fl_${suffix}@example.com`;
  const password = "e2e-pass-ok-12";

  // 1) Register client + freelancer
  const regClient = await api("/api/auth/register", {
    method: "POST",
    json: { fullName: "E2E Client", email: clientEmail, password, role: "CLIENT" }
  });
  assert.equal(regClient.res.status, 201, `register client: ${JSON.stringify(regClient.body)}`);
  assert.equal(regClient.body.success, true);
  let cookieClient = sessionCookiePairFromResponse(regClient.res);
  assert.ok(cookieClient, "client register should Set-Cookie session");

  const regFl = await api("/api/auth/register", {
    method: "POST",
    json: { fullName: "E2E Freelancer", email: freelancerEmail, password, role: "FREELANCER" }
  });
  assert.equal(regFl.res.status, 201, `register freelancer: ${JSON.stringify(regFl.body)}`);
  let cookieFreelancer = sessionCookiePairFromResponse(regFl.res);
  assert.ok(cookieFreelancer, "freelancer register should Set-Cookie session");

  // Complete freelancer profile for bid policy (bio required for isComplete).
  const patchBio = await api("/api/freelancer-profiles", {
    method: "PATCH",
    cookie: cookieFreelancer,
    json: {
      bio: "E2E freelancer bio — completed profile for bidding eligibility. Min content."
    }
  });
  assert.equal(patchBio.res.status, 200, `PATCH freelancer bio: ${JSON.stringify(patchBio.body)}`);

  // 2) Login (session cookie) + session endpoint
  const loginClient = await api("/api/auth/login", {
    method: "POST",
    json: { email: clientEmail, password }
  });
  assert.equal(loginClient.res.status, 200);
  const loginCookie = sessionCookiePairFromResponse(loginClient.res);
  assert.ok(loginCookie, "login should set session cookie");
  cookieClient = loginCookie;

  const sessionCheck = await api("/api/auth/session", { cookie: cookieClient });
  assert.equal(sessionCheck.res.status, 200, JSON.stringify(sessionCheck.body));
  assert.equal(sessionCheck.body.data.role, "CLIENT");

  // Category for job
  const cats = await api("/api/categories?page=1&limit=5");
  assert.equal(cats.res.status, 200);
  assert.equal(cats.body.data.mode, "categories");
  assert.ok(cats.body.data.items?.length, "need at least one category in DB for job creation");
  const categoryId = cats.body.data.items[0].id;

  // 3) Client creates job
  const jobBody = {
    title: "E2E integration job",
    description:
      "This is a long enough description for the marketplace E2E validation flow to succeed.",
    categoryId,
    workMode: "REMOTE",
    budgetType: "FIXED",
    budgetMin: 100,
    budgetMax: 500,
    currency: "USD"
  };
  const jobRes = await api("/api/jobs", { method: "POST", cookie: cookieClient, json: jobBody });
  assert.equal(jobRes.res.status, 201, JSON.stringify(jobRes.body));
  const jobId = jobRes.body.data.id;
  assert.ok(jobId);

  // 4) Freelancer submits bid
  const bidRes = await api("/api/bids", {
    method: "POST",
    cookie: cookieFreelancer,
    json: {
      jobId,
      coverLetter:
        "I am an experienced developer ready to deliver this scope with care and attention.",
      bidAmount: 250,
      estimatedDays: 7
    }
  });
  assert.equal(bidRes.res.status, 201, JSON.stringify(bidRes.body));
  const bidId = bidRes.body.data.id;
  assert.ok(bidId);

  // Trust: client reports the bid (participant → policy allows)
  const report = await postWithCsrf(
    "/api/reports",
    cookieClient,
    {
      subjectType: "BID",
      subjectBidId: bidId,
      category: "policy",
      description: "E2E moderation smoke: client reports this proposal for staff queue verification."
    }
  );
  assert.equal(report.res.status, 201, JSON.stringify(report.body));
  assert.equal(report.body.success, true);
  const createdReportId = report.body.data?.id;
  assert.ok(createdReportId);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@nearwork.local").toLowerCase().trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "NearWorkAdminDev123!";
  const adminLogin = await api("/api/auth/login", {
    method: "POST",
    json: { email: adminEmail, password: adminPassword }
  });
  assert.equal(adminLogin.res.status, 200, JSON.stringify(adminLogin.body));
  const cookieAdmin = sessionCookiePairFromResponse(adminLogin.res);
  assert.ok(cookieAdmin, "admin login should set session");
  const queue = await api("/api/admin/reports?page=1&limit=50", { cookie: cookieAdmin });
  assert.equal(queue.res.status, 200, JSON.stringify(queue.body));
  const seen = queue.body.data?.items?.some((r) => r.id === createdReportId);
  assert.ok(seen, "admin queue should include the submitted report");

  // 7) Notification: new bid (client)
  const notifAfterBid = await api("/api/notifications", { cookie: cookieClient });
  assert.equal(notifAfterBid.res.status, 200);
  const bidNotif = notifAfterBid.body.data.items.find((n) => n.type === "BID_SUBMITTED");
  assert.ok(bidNotif, "client should receive BID_SUBMITTED");
  assert.equal(bidNotif.payload?.bidId, bidId);

  // 5) Client accepts bid → contract
  const accept = await api(`/api/bids/${bidId}/accept`, { method: "POST", cookie: cookieClient });
  assert.equal(accept.res.status, 201, JSON.stringify(accept.body));
  const contractId = accept.body.data.id;
  assert.ok(contractId);

  const notifFl = await api("/api/notifications", { cookie: cookieFreelancer });
  assert.equal(notifFl.res.status, 200);
  const acceptedNotif = notifFl.body.data.items.find((n) => n.type === "BID_ACCEPTED");
  assert.ok(acceptedNotif, "freelancer should receive BID_ACCEPTED");
  assert.equal(acceptedNotif.payload?.contractId, contractId);

  // 6) Messaging on contract thread
  const threadRes = await api("/api/messages", {
    method: "POST",
    cookie: cookieClient,
    json: { type: "CONTRACT", contractId }
  });
  assert.equal(threadRes.res.status, 201, JSON.stringify(threadRes.body));
  const threadId = threadRes.body.data.threadId;
  assert.ok(threadId);

  const msgClient = await api(`/api/messages/${threadId}`, {
    method: "POST",
    cookie: cookieClient,
    json: { body: "Hello from client on the contract thread." }
  });
  assert.equal(msgClient.res.status, 201, JSON.stringify(msgClient.body));

  const msgFl = await api(`/api/messages/${threadId}`, {
    method: "POST",
    cookie: cookieFreelancer,
    json: { body: "Hello from freelancer — received and working." }
  });
  assert.equal(msgFl.res.status, 201, JSON.stringify(msgFl.body));

  // 7) Notification: new message (recipient sees NEW_MESSAGE)
  const notifFlAfterMsg = await api("/api/notifications", { cookie: cookieFreelancer });
  const newMsgNotif = notifFlAfterMsg.body.data.items.find(
    (n) => n.type === "NEW_MESSAGE" && n.payload?.threadId === threadId
  );
  assert.ok(newMsgNotif, "freelancer should receive NEW_MESSAGE for contract thread");

  // 8) Contract COMPLETED
  const complete = await api(`/api/contracts/${contractId}/complete`, {
    method: "POST",
    cookie: cookieClient
  });
  assert.equal(complete.res.status, 200, JSON.stringify(complete.body));
  assert.equal(complete.body.data.status, "COMPLETED");

  const completeAgain = await api(`/api/contracts/${contractId}/complete`, {
    method: "POST",
    cookie: cookieFreelancer
  });
  assert.equal(completeAgain.res.status, 409, "second complete should be idempotent conflict");
  assert.equal(completeAgain.body.code, "ALREADY_COMPLETED");

  // Profile ids for reviews aggregate checks
  const meFl = await api("/api/freelancer-profiles/me", { cookie: cookieFreelancer });
  assert.equal(meFl.res.status, 200);
  const freelancerProfileId = meFl.body.data.id;

  const meClient = await api("/api/client-profiles", { cookie: cookieClient });
  assert.equal(meClient.res.status, 200);
  const clientProfileId = meClient.body.data.id;

  // 9) Reviews (client → freelancer, freelancer → client)
  const revA = await api("/api/reviews", {
    method: "POST",
    cookie: cookieClient,
    json: { contractId, targetType: "FREELANCER", rating: 5, comment: "Excellent E2E work." }
  });
  assert.equal(revA.res.status, 201, JSON.stringify(revA.body));

  const revB = await api("/api/reviews", {
    method: "POST",
    cookie: cookieFreelancer,
    json: { contractId, targetType: "CLIENT", rating: 4, comment: "Clear requirements, good client." }
  });
  assert.equal(revB.res.status, 201, JSON.stringify(revB.body));

  // 10) Aggregates on review list + no duplicate review policy
  const dup = await api("/api/reviews", {
    method: "POST",
    cookie: cookieClient,
    json: { contractId, targetType: "FREELANCER", rating: 3 }
  });
  assert.equal(dup.res.status, 403, "duplicate review for same party should be denied");

  const listFl = await api(`/api/reviews?freelancerProfileId=${encodeURIComponent(freelancerProfileId)}`);
  assert.equal(listFl.res.status, 200);
  assert.equal(listFl.body.data.aggregate.reviewCount, 1);
  assert.equal(listFl.body.data.aggregate.averageReviewRating, 5);

  const listCl = await api(`/api/reviews?clientProfileId=${encodeURIComponent(clientProfileId)}`);
  assert.equal(listCl.res.status, 200);
  assert.equal(listCl.body.data.aggregate.reviewCount, 1);
  assert.equal(listCl.body.data.aggregate.averageReviewRating, 4);
});

test("pre-hire proposal loop: JOB thread after bid + first message", async () => {
  const suffix = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  const clientEmail = `e2e_discuss_client_${suffix}@example.com`;
  const freelancerEmail = `e2e_discuss_fl_${suffix}@example.com`;
  const password = "e2e-pass-ok-12";

  const regClient = await api("/api/auth/register", {
    method: "POST",
    json: { fullName: "E2E Discuss Client", email: clientEmail, password, role: "CLIENT" }
  });
  assert.equal(regClient.res.status, 201, JSON.stringify(regClient.body));
  let cookieClient = sessionCookiePairFromResponse(regClient.res);
  assert.ok(cookieClient);

  const regFl = await api("/api/auth/register", {
    method: "POST",
    json: { fullName: "E2E Discuss FL", email: freelancerEmail, password, role: "FREELANCER" }
  });
  assert.equal(regFl.res.status, 201, JSON.stringify(regFl.body));
  let cookieFreelancer = sessionCookiePairFromResponse(regFl.res);
  assert.ok(cookieFreelancer);

  const patchBio = await api("/api/freelancer-profiles", {
    method: "PATCH",
    cookie: cookieFreelancer,
    json: { bio: "E2E discuss path — freelancer profile complete enough to bid." }
  });
  assert.equal(patchBio.res.status, 200, JSON.stringify(patchBio.body));

  const loginClient = await api("/api/auth/login", {
    method: "POST",
    json: { email: clientEmail, password }
  });
  assert.equal(loginClient.res.status, 200);
  cookieClient = sessionCookiePairFromResponse(loginClient.res);
  assert.ok(cookieClient);

  const loginFreelancer = await api("/api/auth/login", {
    method: "POST",
    json: { email: freelancerEmail, password }
  });
  assert.equal(loginFreelancer.res.status, 200);
  cookieFreelancer = sessionCookiePairFromResponse(loginFreelancer.res);
  assert.ok(cookieFreelancer);

  const flSession = await api("/api/auth/session", { cookie: cookieFreelancer });
  assert.equal(flSession.res.status, 200, JSON.stringify(flSession.body));
  const freelancerUserId = flSession.body.data.userId;
  assert.ok(freelancerUserId);

  const cats = await api("/api/categories?page=1&limit=5");
  assert.equal(cats.res.status, 200);
  const categoryId = cats.body.data.items[0].id;

  const jobRes = await api("/api/jobs", {
    method: "POST",
    cookie: cookieClient,
    json: {
      title: "E2E pre-hire messaging job",
      description:
        "Smoke path: client hires via discussion before accept—description long enough for validation.",
      categoryId,
      workMode: "REMOTE",
      budgetType: "FIXED",
      budgetMin: 50,
      budgetMax: 300,
      currency: "USD"
    }
  });
  assert.equal(jobRes.res.status, 201, JSON.stringify(jobRes.body));
  const jobId = jobRes.body.data.id;
  assert.ok(jobId);

  const bidRes = await api("/api/bids", {
    method: "POST",
    cookie: cookieFreelancer,
    json: {
      jobId,
      coverLetter:
        "Intro: E2E.\nRelevant experience: prior similar scope.\nApproach: milestone plan.\nTimeline & availability: 5 business days from kickoff.",
      bidAmount: 120,
      estimatedDays: 5
    }
  });
  assert.equal(bidRes.res.status, 201, JSON.stringify(bidRes.body));

  const threadCreate = await postWithCsrf(
    "/api/messages",
    cookieClient,
    {
      type: "JOB",
      jobId,
      withUserId: freelancerUserId
    }
  );
  assert.equal(threadCreate.res.status, 201, JSON.stringify(threadCreate.body));
  const threadId = threadCreate.body.data?.threadId;
  assert.ok(threadId);

  const firstMsg = await postWithCsrf(
    `/api/messages/${threadId}`,
    cookieClient,
    { body: "Client opening note on the job-linked thread before hire." }
  );
  assert.equal(firstMsg.res.status, 201, JSON.stringify(firstMsg.body));
});
