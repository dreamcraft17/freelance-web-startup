import { expect, test } from "@playwright/test";

test.describe("Mobile marketplace UX", () => {
  test("mobile filter drawer opens and applies", async ({ page }) => {
    await page.goto("/en/jobs");
    await page.getByRole("button", { name: /filter|filters/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator('select[name="workMode"]').selectOption("REMOTE");
    await dialog.getByRole("button", { name: /apply/i }).click();
    await expect(page).toHaveURL(/workMode=REMOTE/);
  });

  test("sticky CTA visible on mobile job detail", async ({ page }) => {
    await page.goto("/en/jobs");
    await page.getByRole("link", { name: /view job|lihat brief/i }).first().click();
    await expect(page.locator('a[href="#nw-proposal-section"]')).toBeVisible();
  });
});
