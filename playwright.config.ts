import { defineConfig, devices } from "@playwright/test";
import { databaseUrlForPlaywrightWebServer } from "./tests/playwright/helpers/env";

const webPort = Number(process.env.PLAYWRIGHT_WEB_PORT ?? 3000);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL?.trim() ||
  process.env.BASE_URL?.trim() ||
  `http://localhost:${webPort}`;
const shouldReuseServer = process.env.PLAYWRIGHT_REUSE_SERVER === "1";

const desktopChromeEn = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1440, height: 900 },
  locale: "en-US" as const
};

const desktopChromeId = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1440, height: 900 },
  locale: "id-ID" as const
};

const resolvedDbUrl = databaseUrlForPlaywrightWebServer();
const webServerEnv: NodeJS.ProcessEnv = {
  ...process.env,
  SESSION_SECRET: process.env.SESSION_SECRET ?? "NearWorkPlaywrightSessionSecret123!"
};
if (resolvedDbUrl) {
  webServerEnv.DATABASE_URL = resolvedDbUrl;
}

export default defineConfig({
  testDir: "./tests/playwright/specs",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  outputDir: "test-results/playwright",
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.03
    }
  },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report/nearwork" }]
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    navigationTimeout: 20_000,
    actionTimeout: 10_000
  },
  snapshotPathTemplate: "{testDir}/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}",
  projects: [
    {
      name: "setup",
      testMatch: /storage-state\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        locale: "en-US"
      }
    },
    {
      name: "auth-en",
      testMatch: /auth\.spec\.ts/,
      use: desktopChromeEn
    },
    {
      name: "auth-id",
      testMatch: /auth\.spec\.ts/,
      use: desktopChromeId
    },
    {
      name: "marketplace-en",
      dependencies: ["setup"],
      testMatch: /marketplace\.spec\.ts/,
      use: desktopChromeEn
    },
    {
      name: "marketplace-id",
      dependencies: ["setup"],
      testMatch: /marketplace\.spec\.ts/,
      use: desktopChromeId
    },
    {
      name: "messaging-en",
      dependencies: ["setup"],
      testMatch: /freelancer-client\.spec\.ts/,
      use: desktopChromeEn
    },
    {
      name: "messaging-id",
      dependencies: ["setup"],
      testMatch: /freelancer-client\.spec\.ts/,
      use: desktopChromeId
    },
    {
      name: "mobile-en",
      testMatch: /.*\.mobile\.spec\.ts/,
      use: {
        ...devices["iPhone 13"],
        locale: "en-US"
      }
    },
    {
      name: "mobile-id",
      testMatch: /.*\.mobile\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        locale: "id-ID"
      }
    },
    {
      name: "design-en",
      dependencies: ["setup"],
      testMatch: /design-qa\.spec\.ts/,
      use: desktopChromeEn
    },
    {
      name: "design-id",
      dependencies: ["setup"],
      testMatch: /design-qa\.spec\.ts/,
      use: desktopChromeId
    }
  ],
  webServer: {
    command: `pnpm --filter @acme/web build && pnpm --filter @acme/web exec next start -p ${webPort} -H localhost`,
    url: `${baseURL}/api/auth/csrf`,
    env: webServerEnv,
    reuseExistingServer: shouldReuseServer,
    timeout: 120_000
  }
});
