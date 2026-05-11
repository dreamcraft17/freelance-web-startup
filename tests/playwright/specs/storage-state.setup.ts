import * as fs from "fs/promises";
import path from "path";
import { test as setup } from "@playwright/test";
import { PLAYWRIGHT_E2E_PASSWORD } from "../helpers/factory";
import { CLIENT_STORAGE_STATE, CREDENTIALS_JSON, FREELANCER_STORAGE_STATE, PLAYWRIGHT_AUTH_DIR } from "../helpers/paths";
import { completeFreelancerProfile, registerViaUi, uniqueEmail } from "../helpers/session";

/**
 * Registers one CLIENT + one FREELANCER once per run (per shard) and writes storageState JSON
 * plus credentials.json for specs that need known emails (locale login flow).
 */
setup("provision shared Playwright accounts", async ({ browser }) => {
  await fs.mkdir(PLAYWRIGHT_AUTH_DIR, { recursive: true });
  const password = PLAYWRIGHT_E2E_PASSWORD;
  const clientEmail = uniqueEmail("pw_fixture_client");
  const freelancerEmail = uniqueEmail("pw_fixture_freelancer");

  const clientCtx = await browser.newContext();
  try {
    const page = await clientCtx.newPage();
    await registerViaUi(page, { email: clientEmail, password, role: "CLIENT", fullName: "PW Fixture Client" });
    await clientCtx.storageState({ path: CLIENT_STORAGE_STATE });
  } finally {
    await clientCtx.close();
  }

  const freelCtx = await browser.newContext();
  try {
    const page = await freelCtx.newPage();
    await registerViaUi(page, { email: freelancerEmail, password, role: "FREELANCER", fullName: "PW Fixture Freelancer" });
    await completeFreelancerProfile(page);
    await freelCtx.storageState({ path: FREELANCER_STORAGE_STATE });
  } finally {
    await freelCtx.close();
  }

  await fs.writeFile(CREDENTIALS_JSON, JSON.stringify({ clientEmail, freelancerEmail, password }, null, 2), "utf8");
});
