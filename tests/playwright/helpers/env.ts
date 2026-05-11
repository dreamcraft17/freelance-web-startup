/**
 * Playwright / webServer environment helpers.
 * Prefer DATABASE_URL_TEST so browser E2E does not contend with dev DB pool limits.
 */
export function resolvePlaywrightDatabaseUrl(): string | undefined {
  const fromTest = process.env.DATABASE_URL_TEST?.trim();
  if (fromTest) return fromTest;
  return process.env.DATABASE_URL?.trim() || undefined;
}

/**
 * DATABASE_URL passed to Next when Playwright starts the web server.
 * Maps DATABASE_URL_TEST → DATABASE_URL for the child process (Prisma reads DATABASE_URL).
 */
export function databaseUrlForPlaywrightWebServer(): string | undefined {
  return resolvePlaywrightDatabaseUrl();
}
