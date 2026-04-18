import type { NextConfig } from "next";

// CJS plugin — Prisma monorepo workaround copies query engine into the server bundle output
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin") as {
  PrismaPlugin: new () => { apply: (compiler: unknown) => void };
};

/** Baseline headers for all routes. CSP is a separate milestone (needs nonces / asset audit). */
function buildSecurityHeaders(): { key: string; value: string }[] {
  const headers: { key: string; value: string }[] = [
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
    },
    { key: "X-Frame-Options", value: "DENY" }
  ];
  if (process.env.NEARWORK_ENABLE_HSTS === "1") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=15552000; includeSubDomains"
    });
  }
  return headers;
}

const nextConfig: NextConfig = {
  typedRoutes: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: buildSecurityHeaders() }];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins ?? []), new PrismaPlugin()];
    }
    return config;
  }
};

export default nextConfig;
