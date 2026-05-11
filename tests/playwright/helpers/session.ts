import { expect, type Browser, type Page } from "@playwright/test";

export type UserRole = "CLIENT" | "FREELANCER";
export type AuthCredentials = {
  email: string;
  password: string;
  role: UserRole;
  fullName?: string;
};

type AuthUiResult = {
  status: number;
  body: unknown;
};

export function uniqueEmail(prefix: string): string {
  const stamp = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  return `${prefix}_${stamp}@example.com`;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function registerUser(page: Page, params: AuthCredentials): Promise<AuthUiResult> {
  const fullName = params.fullName ?? `${params.role} Playwright`;
  await page.goto("/register");
  await page.locator('[data-testid="register-full-name"]').fill(fullName);
  await page.locator('[data-testid="register-email"]').fill(params.email);
  await page.locator('[data-testid="register-password"]').fill(params.password);
  await page.locator('[data-testid="register-confirm-password"]').fill(params.password);
  await page.locator(`[data-testid="register-role-${params.role.toLowerCase()}"]`).check();
  const responsePromise = page.waitForResponse((response) => {
    return response.url().includes("/api/auth/register") && response.request().method() === "POST";
  });
  await page.locator('[data-testid="register-submit"]').click();
  const response = await responsePromise;
  return {
    status: response.status(),
    body: await parseJsonSafe(response)
  };
}

export async function registerViaUi(page: Page, params: AuthCredentials) {
  const result = await registerUser(page, params);
  expect(result.status, `register failed: ${JSON.stringify(result.body)}`).toBe(201);
}

export async function loginUser(page: Page, email: string, password: string): Promise<AuthUiResult> {
  await page.goto("/login");
  await page.locator('[data-testid="login-email"]').fill(email);
  await page.locator('[data-testid="login-password"]').fill(password);
  const responsePromise = page.waitForResponse((response) => {
    return response.url().includes("/api/auth/login") && response.request().method() === "POST";
  });
  await page.locator('[data-testid="login-submit"]').click();
  const response = await responsePromise;
  return {
    status: response.status(),
    body: await parseJsonSafe(response)
  };
}

export async function loginViaUi(page: Page, email: string, password: string, expectedStatus = 200) {
  const result = await loginUser(page, email, password);
  expect(result.status, `login failed: ${JSON.stringify(result.body)}`).toBe(expectedStatus);
}

export async function createAuthenticatedContext(
  browser: Browser,
  params: AuthCredentials & { expectedWorkspace?: "client" | "freelancer" }
) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await registerViaUi(page, params);
  const workspace = params.expectedWorkspace ?? (params.role === "CLIENT" ? "client" : "freelancer");
  await expect(page).toHaveURL(new RegExp(`/(en|id)/${workspace}|/${workspace}`));
  return { context, page };
}

export async function logoutViaUi(page: Page) {
  await page.goto("/settings");
  const logoutButton = page.getByRole("button", { name: /log out|sign out|keluar/i });
  await expect(logoutButton).toBeVisible();
  await logoutButton.click();
  await expect(page).toHaveURL(/\/login|\/(en|id)$/);
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/login/);
}

export async function completeFreelancerProfile(page: Page) {
  await page.goto("/freelancer/profile");
  const username = `pw_${Math.random().toString(36).slice(2, 8)}`;
  await page.locator("#fp-username").fill(username);
  await page.locator("#fp-fullName").fill("PW Freelancer");
  await page.locator("#fp-bio").fill("Playwright freelancer profile completion for marketplace browser tests.");
  await page.getByRole("button", { name: /create profile|save changes|simpan/i }).click();
  await expect(page.getByText(/profile created|changes saved|profil/i)).toBeVisible();
}
