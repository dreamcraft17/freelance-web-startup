import { db } from "@acme/database";
import type { Prisma } from "@acme/database";
import type { SkillListQueryDto } from "@acme/validators";
import { clampLimit, clampPage, offsetFromPage } from "@acme/utils";

export type SkillRow = {
  id: string;
  slug: string;
  name: string;
  categoryId: string | null;
  subcategoryId: string | null;
  category: { id: string; slug: string; name: string } | null;
  subcategory: { id: string; slug: string; name: string } | null;
};

export type SkillDetail = SkillRow;

export class SkillService {
  async list(query: SkillListQueryDto) {
    const page = clampPage(query.page);
    const limit = clampLimit(query.limit);
    const skip = offsetFromPage({ page, limit });

    const where: Prisma.SkillWhereInput = { isActive: true };

    const categoryId = query.categoryId?.trim();
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const q = query.q?.trim();
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } }
      ];
    }

    const [rows, total] = await Promise.all([
      db.skill.findMany({
        where,
        orderBy: [{ name: "asc" }],
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          categoryId: true,
          subcategoryId: true,
          category: {
            where: { isActive: true },
            select: { id: true, slug: true, name: true }
          },
          subcategory: {
            where: { isActive: true },
            select: { id: true, slug: true, name: true }
          }
        }
      }),
      db.skill.count({ where })
    ]);

    const items: SkillRow[] = rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      categoryId: s.categoryId,
      subcategoryId: s.subcategoryId,
      category: s.category,
      subcategory: s.subcategory
    }));

    return { items, total };
  }

  async getById(skillId: string): Promise<SkillDetail | null> {
    const id = skillId.trim();
    if (!id) return null;

    const s = await db.skill.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        categoryId: true,
        subcategoryId: true,
        category: {
          where: { isActive: true },
          select: { id: true, slug: true, name: true }
        },
        subcategory: {
          where: { isActive: true },
          select: { id: true, slug: true, name: true }
        }
      }
    });

    if (!s) return null;

    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      categoryId: s.categoryId,
      subcategoryId: s.subcategoryId,
      category: s.category,
      subcategory: s.subcategory
    };
  }
}
