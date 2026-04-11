import type { CategoryListQueryDto } from "@acme/validators";

export class CategoryService {
  async list(_query: CategoryListQueryDto) {
    return { items: [] as const, total: 0 };
  }

  async getBySlug(_slug: string) {
    return null as { slug: string; name: string } | null;
  }
}
