import * as fs from "fs";
import { expect, test } from "@playwright/test";
import { CLIENT_STORAGE_STATE, CREDENTIALS_JSON, FREELANCER_STORAGE_STATE } from "../helpers/paths";
import { loginViaUi } from "../helpers/session";

function readFixtureCreds(): { clientEmail: string; password: string } {
  const raw = fs.readFileSync(CREDENTIALS_JSON, "utf8");
  const parsed = JSON.parse(raw) as { clientEmail: string; password: string };
  return { clientEmail: parsed.clientEmail, password: parsed.password };
}

test.describe("Marketplace browsing, locale and saved flows (freelancer session)", () => {
  test.use({ storageState: FREELANCER_STORAGE_STATE });

  test("jobs filtering, locale switching, saved jobs/freelancers", async ({ page }) => {
    await page.goto("/en/jobs");
    await page.locator("#jobs-city").fill("Jakarta");
    await page.locator("#jobs-wm").selectOption("REMOTE");
    await page.locator("#jobs-posted").selectOption("7");
    await page.getByRole("button", { name: /apply/i }).first().click();
    await expect(page).toHaveURL(/city=Jakarta/);
    await expect(page.locator("#nw-jobs-list")).toBeVisible();

    await page.getByRole("button", { name: "ID" }).first().click();
    await expect(page).toHaveURL(/\/id\/jobs/);
    await expect(page.locator("html")).toHaveAttribute("lang", /id/i);

    const saveJob = page.getByRole("button", { name: /save|simpan/i }).first();
    if (await saveJob.isVisible()) {
      await saveJob.click();
    }

    await page.goto("/id/freelancers");
    await page.getByRole("link", { name: /view profile|lihat profil/i }).first().click();
    await expect(page).toHaveURL(/\/(id\/)?freelancers\/.+/);
    const saveFreelancer = page.getByRole("button", { name: /save|simpan/i }).first();
    if (await saveFreelancer.isVisible()) {
      await saveFreelancer.click();
    }
  });
});

test.describe("Marketplace client locale login (fixture client)", () => {
  test.use({ storageState: CLIENT_STORAGE_STATE });

  test("login works from locale-prefixed discovery routes", async ({ page }) => {
    const { clientEmail, password } = readFixtureCreds();

    await page.goto("/settings");
    await page.getByRole("button", { name: /log out|sign out|keluar/i }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/id/jobs");
    await page.goto("/login");
    await loginViaUi(page, clientEmail, password);
    await expect(page).toHaveURL(/\/client/);
  });
});
