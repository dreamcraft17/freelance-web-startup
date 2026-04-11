import type { SkillListQueryDto } from "@acme/validators";

export class SkillService {
  async list(_query: SkillListQueryDto) {
    return { items: [] as const, total: 0 };
  }

  async getById(skillId: string) {
    return { id: skillId } as { id: string; name?: string } | null;
  }
}
