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
      message: `Empty server reply (HTTP ${status}). If this persists, contact support with the time you tried to sign in.`
    };
  }

  try {
    return { ok: true, status, data: JSON.parse(trimmed) as T };
  } catch {
    return {
      ok: false,
      status,
      message: `Unexpected reply (HTTP ${status}). Often a gateway or temporary outage—try again in a moment.`
    };
  }
}
