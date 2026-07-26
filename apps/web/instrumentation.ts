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
      "NextWork: SESSION_SECRET must be set in production and be at least 16 characters (use 32+ random bytes, e.g. openssl rand -base64 32)."
    );
  }
  if (secret.length < 32) {
    console.warn(
      "[nextwork] SESSION_SECRET is under 32 characters — prefer a longer secret for production entropy."
    );
  }

  // Prefer explicit public URL; on Vercel fall back to VERCEL_URL so preview/prod
  // boots without a hard 500 when NEXT_PUBLIC_APP_URL is not yet configured.
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL?.trim() ? `https://${process.env.VERCEL_URL.trim()}` : "");
  if (!appUrl) {
    throw new Error(
      "NextWork: set NEXT_PUBLIC_APP_URL in production (e.g. https://app.example.com), or deploy on Vercel so VERCEL_URL is available."
    );
  }
  if (!process.env.NEXT_PUBLIC_APP_URL?.trim() && process.env.VERCEL_URL?.trim()) {
    console.warn(
      `[nextwork] NEXT_PUBLIC_APP_URL unset — using https://${process.env.VERCEL_URL.trim()} for checkout/canonical URLs. Set NEXT_PUBLIC_APP_URL to your stable domain.`
    );
  }
}
