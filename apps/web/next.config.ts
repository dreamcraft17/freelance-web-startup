import type { NextConfig } from "next";

// CJS plugin — Prisma monorepo workaround copies query engine into the server bundle output
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin") as {
  PrismaPlugin: new () => { apply: (compiler: unknown) => void };
};

const nextConfig: NextConfig = {
  typedRoutes: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins ?? []), new PrismaPlugin()];
    }
    return config;
  }
};

export default nextConfig;
