import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

export { PaymentIntentKind, PaymentIntentStatus, Prisma } from "@prisma/client";
export { Decimal } from "@prisma/client/runtime/library";
export type { ClientProfile, FreelancerProfile } from "@prisma/client";
