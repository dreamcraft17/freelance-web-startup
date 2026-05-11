import path from "path";

export const PLAYWRIGHT_AUTH_DIR = path.join(process.cwd(), "tests/playwright/.auth");

export const CLIENT_STORAGE_STATE = path.join(PLAYWRIGHT_AUTH_DIR, "client.json");

export const FREELANCER_STORAGE_STATE = path.join(PLAYWRIGHT_AUTH_DIR, "freelancer.json");

export const CREDENTIALS_JSON = path.join(PLAYWRIGHT_AUTH_DIR, "credentials.json");
