import { expect, test } from "@playwright/test";
import { CLIENT_STORAGE_STATE } from "../helpers/paths";

function boxesOverlap(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test.describe("Design QA checks", () => {
  test("EN/ID jobs layout stability and optional visual snapshots", async ({ page }) => {
    await page.goto("/en/jobs");
    await expect(page.locator("main")).toBeVisible();
    if (process.env.PLAYWRIGHT_VISUAL_SNAPSHOTS === "1") {
      await expect(page).toHaveScreenshot("jobs-en.png", { fullPage: true });
    }

    await page.goto("/id/jobs");
    await expect(page.locator("main")).toBeVisible();
    if (process.env.PLAYWRIGHT_VISUAL_SNAPSHOTS === "1") {
      await expect(page).toHaveScreenshot("jobs-id.png", { fullPage: true });
    }
  });

  test("chip wrapping stays inside card on mobile widths", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/jobs");
    const card = page.locator("article, li").filter({ hasText: /proposal|budget|remote|onsite|hybrid/i }).first();
    await expect(card).toBeVisible();
    const chip = card.locator(".nw-chip").first();
    if (await chip.isVisible()) {
      const cardBox = await card.boundingBox();
      const chipBox = await chip.boundingBox();
      expect(cardBox).not.toBeNull();
      expect(chipBox).not.toBeNull();
      if (cardBox && chipBox) {
        expect(chipBox.x + chipBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
      }
    }
  });

});

test.describe("Design QA checks (authenticated messages)", () => {
  test.use({ storageState: CLIENT_STORAGE_STATE });

  test("message composer remains visible and controls do not overlap", async ({ page }) => {
    await page.goto("/messages");
    const composer = page.locator("textarea").last();
    await expect(composer).toBeVisible();
    const sendButton = page.getByRole("button", { name: /send|kirim/i }).first();
    if (await sendButton.isVisible()) {
      const composerBox = await composer.boundingBox();
      const sendBox = await sendButton.boundingBox();
      expect(composerBox).not.toBeNull();
      expect(sendBox).not.toBeNull();
      if (composerBox && sendBox) {
        expect(boxesOverlap(composerBox, sendBox)).toBe(false);
      }
    }
  });
});
