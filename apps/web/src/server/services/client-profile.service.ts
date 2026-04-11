import type { CreateClientProfileDto } from "@acme/validators";
import type { ClientProfile } from "@prisma/client";
import { db } from "@acme/database";
import type { AuthActor } from "@/server/domain/auth-actor";
import { JobPolicy } from "@/server/policies/job.policy";
import { DomainError, NotFoundError } from "@/server/errors/domain-errors";

export type ClientProfileView = {
  id: string;
  userId: string;
  displayName: string;
  companyName: string | null;
  industry: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateClientProfileDto = Partial<CreateClientProfileDto>;

function mapClientProfile(row: ClientProfile): ClientProfileView {
  return {
    id: row.id,
    userId: row.userId,
    displayName: row.displayName,
    companyName: row.companyName,
    industry: row.industry,
    city: row.city,
    region: row.region,
    country: row.country,
    verificationStatus: row.verificationStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function assertUpdatePayload(dto: UpdateClientProfileDto): void {
  if (Object.keys(dto).length === 0) {
    throw new DomainError("At least one field is required to update", "EMPTY_UPDATE", 400);
  }
}

export class ClientProfileService {
  async getProfileByUserId(userId: string): Promise<ClientProfileView> {
    const row = await db.clientProfile.findFirst({
      where: { userId, deletedAt: null }
    });
    if (!row) {
      throw new NotFoundError("Client profile not found");
    }
    return mapClientProfile(row);
  }

  async getProfileForActor(actor: AuthActor): Promise<ClientProfileView> {
    return this.getProfileByUserId(actor.userId);
  }

  async createProfile(actor: AuthActor, dto: CreateClientProfileDto): Promise<ClientProfileView> {
    JobPolicy.assertActorMayPerformClientWrites(actor);

    const existingForUser = await db.clientProfile.findFirst({
      where: { userId: actor.userId, deletedAt: null }
    });
    if (existingForUser) {
      throw new DomainError("A client profile already exists for this user", "PROFILE_EXISTS", 409);
    }

    const row = await db.clientProfile.create({
      data: {
        userId: actor.userId,
        displayName: dto.displayName,
        companyName: dto.companyName,
        industry: dto.industry
      }
    });

    return mapClientProfile(row);
  }

  async updateProfile(actor: AuthActor, dto: UpdateClientProfileDto): Promise<ClientProfileView> {
    JobPolicy.assertActorMayPerformClientWrites(actor);
    assertUpdatePayload(dto);

    const current = await db.clientProfile.findFirst({
      where: { userId: actor.userId, deletedAt: null }
    });
    if (!current) {
      throw new NotFoundError("Client profile not found");
    }

    const row = await db.clientProfile.update({
      where: { id: current.id },
      data: {
        ...(dto.displayName !== undefined ? { displayName: dto.displayName } : {}),
        ...(dto.companyName !== undefined ? { companyName: dto.companyName } : {}),
        ...(dto.industry !== undefined ? { industry: dto.industry } : {})
      }
    });

    return mapClientProfile(row);
  }
}
