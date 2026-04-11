import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

export { PaymentIntentKind, PaymentIntentStatus, Prisma } from "@prisma/client";
export type { ClientProfile, FreelancerProfile } from "@prisma/client";
