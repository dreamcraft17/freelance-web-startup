import { db } from "@acme/database";
import type { CategoryListQueryDto } from "@acme/validators";
import { clampLimit, clampPage, offsetFromPage } from "@acme/utils";
import { NotFoundError } from "../errors/domain-errors";

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  displayOrder: number;
};

export type SubcategoryRow = {
  id: string;
  slug: string;
  name: string;
  displayOrder: number;
  categoryId: string;
};

export type CategoryListResult =
  | { mode: "categories"; items: CategoryRow[]; total: number }
  | {
      mode: "subcategories";
      parent: CategoryRow;
      items: SubcategoryRow[];
      total: number;
    };

export type CategoryDetail = CategoryRow & {
  subcategories?: SubcategoryRow[];
};

export class CategoryService {
  async list(query: CategoryListQueryDto): Promise<CategoryListResult> {
    const page = clampPage(query.page);
    const limit = clampLimit(query.limit);
    const skip = offsetFromPage({ page, limit });

    const parentSlug = query.parentSlug?.trim();

    if (!parentSlug) {
      const where = { isActive: true as const };
      const [items, total] = await Promise.all([
        db.category.findMany({
          where,
          orderBy: [{ displayOrder: "asc" }, { slug: "asc" }],
          skip,
          take: limit,
          select: { id: true, slug: true, name: true, displayOrder: true }
        }),
        db.category.count({ where })
      ]);
      return { mode: "categories", items, total };
    }

    const parent = await db.category.findFirst({
      where: { slug: parentSlug, isActive: true },
      select: { id: true, slug: true, name: true, displayOrder: true }
    });
    if (!parent) {
      throw new NotFoundError("Category not found");
    }

    const subWhere = { categoryId: parent.id, isActive: true as const };
    const [items, total] = await Promise.all([
      db.subcategory.findMany({
        where: subWhere,
        orderBy: [{ displayOrder: "asc" }, { slug: "asc" }],
        skip,
        take: limit,
        select: { id: true, slug: true, name: true, displayOrder: true, categoryId: true }
      }),
      db.subcategory.count({ where: subWhere })
    ]);

    return {
      mode: "subcategories",
      parent,
      items,
      total
    };
  }

  async getBySlug(slug: string): Promise<CategoryDetail | null> {
    const trimmed = slug.trim();
    if (!trimmed) return null;

    const category = await db.category.findFirst({
      where: { slug: trimmed, isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        displayOrder: true,
        subcategories: {
          where: { isActive: true },
          orderBy: [{ displayOrder: "asc" }, { slug: "asc" }],
          select: { id: true, slug: true, name: true, displayOrder: true, categoryId: true }
        }
      }
    });

    if (!category) return null;

    const base: CategoryRow = {
      id: category.id,
      slug: category.slug,
      name: category.name,
      displayOrder: category.displayOrder
    };

    if (category.subcategories.length === 0) {
      return base;
    }

    return {
      ...base,
      subcategories: category.subcategories
    };
  }
}
