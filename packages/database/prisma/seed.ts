/**
 * Prisma seed — creates a dev admin user for internal /admin access.
 *
 * Run from monorepo root (with DATABASE_URL set):
 *   pnpm db:seed
 *
 * Override defaults with env:
 *   SEED_ADMIN_EMAIL    default: admin@nearwork.local
 *   SEED_ADMIN_PASSWORD default: NearWorkAdminDev123!
 *
 * Uses bcrypt cost 12 to match AuthService.login.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@nearwork.local").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "NearWorkAdminDev123!";

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      accountStatus: "ACTIVE"
    },
    update: {
      passwordHash,
      role: "ADMIN",
      accountStatus: "ACTIVE",
      deletedAt: null
    }
  });

  // eslint-disable-next-line no-console
  console.log(
    [
      "[seed] Admin user ready:",
      `  email:    ${user.email}`,
      `  role:     ${user.role}`,
      `  userId:   ${user.id}`,
      "",
      "  Log in at /login then open /admin",
      "  (change password in production; do not commit real secrets)"
    ].join("\n")
  );
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
