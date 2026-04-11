import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DEPRECATION_NOTE =
  "The /api/v1 prefix is deprecated. Use the same path under /api (cookie session auth unchanged on the destination).";

type RouteCtx = { params: Promise<{ legacy?: string[] }> };

/**
 * Maps legacy `/api/v1/...` to canonical `/api/...`.
 * - `/api/v1/contracts?id=…` → `/api/contracts/{id}` (other query keys preserved)
 * - `/api/v1/quota` → `/api/quota/me`
 */
function mapV1ToApiUrl(request: NextRequest, legacy: string[]): URL {
  const current = new URL(request.url);
  const origin = current.origin;

  if (legacy.length === 0) {
    return new URL("/api", origin);
  }

  if (legacy[0] === "contracts" && legacy.length === 1) {
    const id = current.searchParams.get("id");
    if (id) {
      const next = new URL(`/api/contracts/${encodeURIComponent(id)}`, origin);
      for (const [key, value] of current.searchParams) {
        if (key !== "id") next.searchParams.append(key, value);
      }
      return next;
    }
  }

  if (legacy[0] === "quota" && legacy.length === 1) {
    const next = new URL("/api/quota/me", origin);
    next.search = current.search;
    return next;
  }

  const next = new URL(`/api/${legacy.join("/")}`, origin);
  next.search = current.search;
  return next;
}

async function redirectToCanonicalApi(request: NextRequest, ctx: RouteCtx): Promise<NextResponse> {
  const { legacy } = await ctx.params;
  const segments = legacy ?? [];
  const target = mapV1ToApiUrl(request, segments);
  const res = NextResponse.redirect(target, 308);
  res.headers.set("X-Api-Deprecation", DEPRECATION_NOTE);
  return res;
}

export async function GET(request: NextRequest, ctx: RouteCtx) {
  return redirectToCanonicalApi(request, ctx);
}

export async function POST(request: NextRequest, ctx: RouteCtx) {
  return redirectToCanonicalApi(request, ctx);
}

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  return redirectToCanonicalApi(request, ctx);
}

export async function PUT(request: NextRequest, ctx: RouteCtx) {
  return redirectToCanonicalApi(request, ctx);
}

export async function DELETE(request: NextRequest, ctx: RouteCtx) {
  return redirectToCanonicalApi(request, ctx);
}

export async function HEAD(request: NextRequest, ctx: RouteCtx) {
  return redirectToCanonicalApi(request, ctx);
}
