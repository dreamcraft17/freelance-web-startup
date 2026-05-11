import { expect, test } from "@playwright/test";
import { PLAYWRIGHT_E2E_PASSWORD } from "../helpers/factory";
import { loginViaUi, logoutViaUi, registerUser, uniqueEmail } from "../helpers/session";

const password = PLAYWRIGHT_E2E_PASSWORD;

test.describe("Auth flows", () => {
  test("register, login, logout, invalid login, duplicate email", async ({ page }) => {
    const email = uniqueEmail("pw_auth");
    const workspacePath = /\/(en|id)\/client|\/client/;

    const registerResult = await registerUser(page, { email, password, role: "CLIENT", fullName: "PW Auth Client" });
    expect(registerResult.status, `register payload: ${JSON.stringify(registerResult.body)}`).toBe(201);
    await expect(page).toHaveURL(workspacePath);

    await logoutViaUi(page);
    await loginViaUi(page, email, "wrong-password-1", 401);
    await expect(page.getByTestId("login-error")).toBeVisible();

    await loginViaUi(page, email, password);
    await expect(page).toHaveURL(workspacePath);

    await logoutViaUi(page);
    const duplicateResult = await registerUser(page, {
      email,
      password,
      role: "CLIENT",
      fullName: "Duplicate Client"
    });
    expect(duplicateResult.status, `duplicate payload: ${JSON.stringify(duplicateResult.body)}`).toBe(409);
    await expect(page.getByTestId("register-error")).toBeVisible();
  });

  test("locale-preserving auth redirect keeps workspace locale", async ({ page }) => {
    const email = uniqueEmail("pw_auth_locale");
    const registerResult = await registerUser(page, {
      email,
      password,
      role: "CLIENT",
      fullName: "PW Locale Client"
    });
    expect(registerResult.status).toBe(201);

    await page.goto("/settings");
    await page.getByRole("button", { name: /log out|sign out|keluar/i }).click();
    await expect(page).toHaveURL(/\/login|\/(en|id)$/);
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/id/client");
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fid%2Fclient/);
    await loginViaUi(page, email, password);
    await expect(page).toHaveURL(/\/id\/client/);
  });
});
