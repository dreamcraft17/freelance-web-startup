/**
 * Prisma seed — dev admin user + taxonomy for local/E2E (categories & skills).
 *
 * Run from monorepo root:
 *   pnpm db:seed
 *
 * Loads monorepo root `.env` (and `.env.local` when present) so `DATABASE_URL` does not require manual export.
 *
 * Override admin defaults with env (never commit real secrets):
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/** Stable slugs so re-seeding is idempotent. */
const TAXONOMY = {
  categorySlug: "design-creative",
  categoryNameEnId: "Design & Creative / Desain & Kreatif",
  subcategorySlug: "branding-visual-identity",
  subcategoryNameEnId: "Branding & visual identity / Branding & identitas visual",
  skillSlug: "logo-design",
  skillNameEnId: "Logo Design / Desain Logo"
} as const;

loadRootDotenv();
const prisma = new PrismaClient();

/** Parse `.env*` into merged map (later files override earlier); only applies keys unset in process.env so shell / CI wins. */
function loadRootDotenv(): void {
  const prismaDir = dirname(fileURLToPath(import.meta.url));
  const dbPkgRoot = dirname(prismaDir);
  const monorepoRoot = resolve(dbPkgRoot, "..", "..");

  function parseFile(filePath: string): Record<string, string> {
    const out: Record<string, string> = {};
    const text = readFileSync(filePath, "utf8");
    for (const rawLine of text.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const exportPrefix = "export ";
      const decl = line.startsWith(exportPrefix) ? line.slice(exportPrefix.length).trim() : line;
      const eq = decl.indexOf("=");
      if (eq === -1) continue;
      const key = decl.slice(0, eq).trim();
      let val = decl.slice(eq + 1).trim();
      if (!key) continue;
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
    return out;
  }

  const merged: Record<string, string> = {};
  const envMain = resolve(monorepoRoot, ".env");
  const envLocal = resolve(monorepoRoot, ".env.local");

  if (existsSync(envMain)) Object.assign(merged, parseFile(envMain));
  if (existsSync(envLocal)) Object.assign(merged, parseFile(envLocal));

  for (const [key, val] of Object.entries(merged)) {
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

async function seedTaxonomy() {
  const category = await prisma.category.upsert({
    where: { slug: TAXONOMY.categorySlug },
    create: {
      slug: TAXONOMY.categorySlug,
      name: TAXONOMY.categoryNameEnId,
      isActive: true,
      displayOrder: 10
    },
    update: {
      name: TAXONOMY.categoryNameEnId,
      isActive: true,
      displayOrder: 10
    }
  });

  const subcategory = await prisma.subcategory.upsert({
    where: { slug: TAXONOMY.subcategorySlug },
    create: {
      slug: TAXONOMY.subcategorySlug,
      name: TAXONOMY.subcategoryNameEnId,
      categoryId: category.id,
      isActive: true,
      displayOrder: 0
    },
    update: {
      name: TAXONOMY.subcategoryNameEnId,
      categoryId: category.id,
      isActive: true,
      displayOrder: 0
    }
  });

  await prisma.skill.upsert({
    where: { slug: TAXONOMY.skillSlug },
    create: {
      slug: TAXONOMY.skillSlug,
      name: TAXONOMY.skillNameEnId,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      isActive: true
    },
    update: {
      name: TAXONOMY.skillNameEnId,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      isActive: true
    }
  });

  return { category, subcategory };
}

async function seedAdmin() {
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

  return user;
}

/** Stable client + freelancer for manual QA and `pnpm test:e2e` (login, job, bid, Messages). */
async function seedE2eFixtures() {
  const clientEmail = (process.env.SEED_E2E_CLIENT_EMAIL ?? "e2e.client@nearwork.local")
    .toLowerCase()
    .trim();
  const freelancerEmail = (process.env.SEED_E2E_FREELANCER_EMAIL ?? "e2e.freelancer@nearwork.local")
    .toLowerCase()
    .trim();
  const password = process.env.SEED_E2E_PASSWORD ?? "NearWorkE2eDev123!";
  const freelancerUsername = (process.env.SEED_E2E_FREELANCER_USERNAME ?? "e2e_freelancer").trim();

  if (password.length < 8) {
    throw new Error("SEED_E2E_PASSWORD must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const clientUser = await prisma.user.upsert({
    where: { email: clientEmail },
    create: {
      email: clientEmail,
      passwordHash,
      role: "CLIENT",
      accountStatus: "ACTIVE"
    },
    update: {
      passwordHash,
      role: "CLIENT",
      accountStatus: "ACTIVE",
      deletedAt: null
    }
  });

  await prisma.clientProfile.upsert({
    where: { userId: clientUser.id },
    create: {
      userId: clientUser.id,
      displayName: "E2E Client (seed)"
    },
    update: {
      displayName: "E2E Client (seed)",
      deletedAt: null
    }
  });

  const freelancerUser = await prisma.user.upsert({
    where: { email: freelancerEmail },
    create: {
      email: freelancerEmail,
      passwordHash,
      role: "FREELANCER",
      accountStatus: "ACTIVE"
    },
    update: {
      passwordHash,
      role: "FREELANCER",
      accountStatus: "ACTIVE",
      deletedAt: null
    }
  });

  const existingProfile = await prisma.freelancerProfile.findFirst({
    where: { userId: freelancerUser.id, deletedAt: null },
    select: { id: true, username: true }
  });

  const bio =
    "Profil seed untuk tes E2E dan cek manual. Bio cukup panjang agar freelancer bisa mengirim proposal.";

  if (existingProfile) {
    await prisma.freelancerProfile.update({
      where: { id: existingProfile.id },
      data: {
        fullName: "E2E Freelancer (seed)",
        bio,
        workMode: "REMOTE",
        availabilityStatus: "AVAILABLE",
        deletedAt: null
      }
    });
  } else {
    const usernameTaken = await prisma.freelancerProfile.findFirst({
      where: {
        username: { equals: freelancerUsername, mode: "insensitive" },
        deletedAt: null,
        NOT: { userId: freelancerUser.id }
      },
      select: { id: true }
    });
    if (usernameTaken) {
      throw new Error(
        `SEED_E2E_FREELANCER_USERNAME "${freelancerUsername}" is already used — set SEED_E2E_FREELANCER_USERNAME in env.`
      );
    }
    await prisma.freelancerProfile.create({
      data: {
        userId: freelancerUser.id,
        username: freelancerUsername,
        fullName: "E2E Freelancer (seed)",
        bio,
        workMode: "REMOTE",
        availabilityStatus: "AVAILABLE"
      }
    });
  }

  return { clientEmail, freelancerEmail, password, freelancerUsername };
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error(
      "DATABASE_URL is not set — add it to the monorepo root `.env` or export it before `pnpm db:seed`."
    );
  }

  const { category, subcategory } = await seedTaxonomy();
  const admin = await seedAdmin();
  const e2e = await seedE2eFixtures();

  // eslint-disable-next-line no-console
  console.log(
    [
      "[seed] Taxonomy:",
      `  category:     ${category.name} (${category.slug})`,
      `  subcategory: ${subcategory.name} (${subcategory.slug})`,
      `  skill:       ${TAXONOMY.skillNameEnId} (${TAXONOMY.skillSlug})`,
      "",
      "[seed] Admin user:",
      `  email:    ${admin.email}`,
      `  role:     ${admin.role}`,
      `  userId:   ${admin.id}`,
      "",
      "  Log in at /login then open /admin",
      "",
      "[seed] E2E fixture accounts (manual + pnpm test:e2e):",
      `  client:      ${e2e.clientEmail}`,
      `  freelancer:  ${e2e.freelancerEmail} (@${e2e.freelancerUsername})`,
      `  password:    ${e2e.password}`,
      "",
      "  After `pnpm test:e2e`, see e2e-test-accounts.local.md for job/thread links.",
      "  (change credentials in production; use env overrides — never commit secrets)"
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
