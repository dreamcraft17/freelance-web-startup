/**
 * Read a JSON API response without throwing — avoids mislabeling HTML error pages as "network" errors.
 */
export async function readApiBody<T>(response: Response): Promise<
  { ok: true; status: number; data: T } | { ok: false; status: number; message: string }
> {
  const status = response.status;
  let text: string;
  try {
    text = await response.text();
  } catch {
    return { ok: false, status, message: "Could not read the server response." };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return {
      ok: false,
      status,
      message: `Empty server reply (HTTP ${status}). Check Vercel deployment logs and environment variables.`
    };
  }

  try {
    return { ok: true, status, data: JSON.parse(trimmed) as T };
  } catch {
    return {
      ok: false,
      status,
      message: `Unexpected reply (HTTP ${status}, not JSON). Often a gateway or config issue—open Vercel logs and confirm DATABASE_URL and SESSION_SECRET are set for Production.`
    };
  }
}
