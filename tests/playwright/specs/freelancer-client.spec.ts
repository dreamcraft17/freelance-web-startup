import { expect, test } from "@playwright/test";
import { buildTestJobTitle } from "../helpers/factory";
import { CLIENT_STORAGE_STATE, FREELANCER_STORAGE_STATE } from "../helpers/paths";

test.describe("Freelancer and client marketplace flow", () => {
  test("client creates job, freelancer submits proposal, client shortlists and messages", async ({ browser }) => {
    const clientContext = await browser.newContext({ storageState: CLIENT_STORAGE_STATE });
    const freelancerContext = await browser.newContext({ storageState: FREELANCER_STORAGE_STATE });
    const clientPage = await clientContext.newPage();
    const freelancerPage = await freelancerContext.newPage();

    const jobTitle = buildTestJobTitle();

    await clientPage.goto("/client/jobs/new");
    await clientPage.locator("#job-title").fill(jobTitle);
    await clientPage.locator("#job-description").fill("Playwright browser flow job description long enough for validation and proposal.");
    await clientPage.locator("#job-category").selectOption({ index: 1 });
    await clientPage.locator('input[name="budgetMin"]').fill("100");
    await clientPage.locator('input[name="budgetMax"]').fill("300");
    await clientPage.locator('select[name="workMode"]').selectOption("REMOTE");
    await clientPage.locator('#new-job-form button[type="submit"]').first().click();
    await expect(clientPage).toHaveURL(/\/jobs\/.+/);

    const jobUrl = clientPage.url();

    await freelancerPage.goto(jobUrl);
    await freelancerPage.locator("#proposal-intro").fill("I can help with this scope and communication rhythm.");
    await freelancerPage.locator("#proposal-experience").fill("Worked on similar projects with clear outcomes.");
    await freelancerPage.locator("#proposal-approach").fill("Milestone-based approach with weekly updates.");
    await freelancerPage.locator("#proposal-timeline").fill("Can start this week and deliver in 5 days.");
    await freelancerPage.locator('input[placeholder="e.g. 1500000"], input[type="number"]').first().fill("200");
    await freelancerPage.locator('input[type="number"]').nth(1).fill("5");
    await freelancerPage.getByRole("button", { name: /send proposal|kirim proposal/i }).first().click();
    await expect(freelancerPage).toHaveURL(/\/messages/);

    await clientPage.goto(jobUrl);
    const shortlist = clientPage.getByRole("button", { name: /shortlist/i });
    if (await shortlist.isVisible()) {
      await shortlist.click();
    }
    const startDiscussion = clientPage.getByRole("button", { name: /start discussion|mulai diskusi/i });
    if (await startDiscussion.isVisible()) {
      await startDiscussion.click();
    } else {
      const openDiscussion = clientPage.getByRole("link", { name: /open discussion|buka diskusi/i });
      if (await openDiscussion.isVisible()) await openDiscussion.click();
    }

    await clientPage.goto("/messages");
    const composer = clientPage.locator("textarea").last();
    await expect(composer).toBeVisible();
    await composer.fill("Hello from playwright client.");
    await clientPage.getByRole("button", { name: /send|kirim/i }).first().click();

    await clientPage.goto("/notifications");
    await expect(clientPage.locator("main")).toContainText(/notification|notifikasi/i);

    await clientContext.close();
    await freelancerContext.close();
  });
});
