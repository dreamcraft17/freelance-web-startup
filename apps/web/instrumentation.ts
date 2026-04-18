/**
 * Runs once per Next.js server process (Node runtime).
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const secret = process.env.SESSION_SECRET?.trim();
  if (process.env.NODE_ENV !== "production") return;

  if (!secret || secret.length < 16) {
    throw new Error(
      "NearWork: SESSION_SECRET must be set in production and be at least 16 characters (use 32+ random bytes, e.g. openssl rand -base64 32)."
    );
  }
  if (secret.length < 32) {
    console.warn(
      "[nearwork] SESSION_SECRET is under 32 characters — prefer a longer secret for production entropy."
    );
  }
}
