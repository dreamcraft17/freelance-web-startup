import { PrismaClient } from "@prisma/client";

/**
 * Single PrismaClient per Node process. Without this, Next.js dev HMR and some
 * server bundles can instantiate many clients and exhaust small DB pools
 * (e.g. Supabase session pooler `pool_size` caps).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const client = globalForPrisma.prisma ?? new PrismaClient({ log: ["error", "warn"] });
globalForPrisma.prisma = client;

export const db = client;

export { PaymentIntentKind, PaymentIntentStatus, Prisma } from "@prisma/client";
export { Decimal } from "@prisma/client/runtime/library";
export type { ClientProfile, FreelancerProfile } from "@prisma/client";
