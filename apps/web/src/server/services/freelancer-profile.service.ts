import type { CreateFreelancerProfileDto } from "@acme/validators";
import { AvailabilityStatus, VerificationStatus, WorkMode } from "@acme/types";
import type { FreelancerProfile } from "@acme/database";
import { db } from "@acme/database";
import type { AuthActor } from "@/server/domain/auth-actor";
import { BidPolicy } from "@/server/policies/bid.policy";
import { DomainError, NotFoundError } from "@/server/errors/domain-errors";
import { isFreelancerBoostActiveAt } from "@/server/lib/promotion-expiry";

export type FreelancerProfileView = {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  hourlyRate: number | null;
  fixedStartingPrice: number | null;
  workMode: WorkMode;
  availabilityStatus: AvailabilityStatus;
  city: string | null;
  region: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  serviceRadiusKm: number | null;
  yearsExperience: number | null;
  verificationStatus: string;
  /** UI-friendly slug for trust / verification badge (derived from `verificationStatus`). */
  verificationBadge: "none" | "pending" | "verified" | "rejected" | "expired";
  profileCompleteness: number;
  isFeatured: boolean;
  isBoosted: boolean;
  boostedUntil: string | null;
  /** Matches search ranking: true only while `boostedUntil` is unset or in the future. */
  isBoostedActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateFreelancerProfileDto = Partial<
  Pick<CreateFreelancerProfileDto, "username" | "fullName" | "headline" | "bio" | "workMode">
> & {
  availabilityStatus?: AvailabilityStatus;
};

function decimalToNumber(value: FreelancerProfile["hourlyRate"]): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

function verificationBadgeFromStatus(status: string): FreelancerProfileView["verificationBadge"] {
  switch (status as VerificationStatus) {
    case VerificationStatus.VERIFIED:
      return "verified";
    case VerificationStatus.PENDING:
      return "pending";
    case VerificationStatus.REJECTED:
      return "rejected";
    case VerificationStatus.EXPIRED:
      return "expired";
    default:
      return "none";
  }
}

function mapFreelancerProfile(row: FreelancerProfile): FreelancerProfileView {
  const now = new Date();
  return {
    id: row.id,
    userId: row.userId,
    username: row.username,
    fullName: row.fullName,
    headline: row.headline,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    hourlyRate: decimalToNumber(row.hourlyRate),
    fixedStartingPrice: decimalToNumber(row.fixedStartingPrice),
    workMode: row.workMode as WorkMode,
    availabilityStatus: row.availabilityStatus as AvailabilityStatus,
    city: row.city,
    region: row.region,
    country: row.country,
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    serviceRadiusKm: row.serviceRadiusKm,
    yearsExperience: row.yearsExperience,
    verificationStatus: row.verificationStatus,
    verificationBadge: verificationBadgeFromStatus(row.verificationStatus),
    profileCompleteness: row.profileCompleteness,
    isFeatured: row.isFeatured,
    isBoosted: row.isBoosted,
    boostedUntil: row.boostedUntil?.toISOString() ?? null,
    isBoostedActive: isFreelancerBoostActiveAt(now, row.isBoosted, row.boostedUntil),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function assertUpdatePayload(dto: UpdateFreelancerProfileDto): void {
  if (Object.keys(dto).length === 0) {
    throw new DomainError("At least one field is required to update", "EMPTY_UPDATE", 400);
  }
}

export class FreelancerProfileService {
  async getProfileByUserId(userId: string): Promise<FreelancerProfileView> {
    const row = await db.freelancerProfile.findFirst({
      where: { userId, deletedAt: null }
    });
    if (!row) {
      throw new NotFoundError("Freelancer profile not found");
    }
    return mapFreelancerProfile(row);
  }

  async getPublicProfileByUsername(username: string): Promise<FreelancerProfileView> {
    const row = await db.freelancerProfile.findFirst({
      where: { username: { equals: username, mode: "insensitive" }, deletedAt: null }
    });
    if (!row) {
      throw new NotFoundError("Freelancer profile not found");
    }
    return mapFreelancerProfile(row);
  }

  async createProfile(actor: AuthActor, dto: CreateFreelancerProfileDto): Promise<FreelancerProfileView> {
    BidPolicy.assertActorMayPerformFreelancerWrites(actor);

    const existingForUser = await db.freelancerProfile.findFirst({
      where: { userId: actor.userId, deletedAt: null }
    });
    if (existingForUser) {
      throw new DomainError("A freelancer profile already exists for this user", "PROFILE_EXISTS", 409);
    }

    const usernameTaken = await db.freelancerProfile.findFirst({
      where: { username: { equals: dto.username, mode: "insensitive" }, deletedAt: null }
    });
    if (usernameTaken) {
      throw new DomainError("Username is already in use", "USERNAME_TAKEN", 409);
    }

    const row = await db.freelancerProfile.create({
      data: {
        userId: actor.userId,
        username: dto.username,
        fullName: dto.fullName,
        headline: dto.headline,
        bio: dto.bio,
        workMode: dto.workMode as FreelancerProfile["workMode"]
      }
    });

    return mapFreelancerProfile(row);
  }

  async updateProfile(actor: AuthActor, dto: UpdateFreelancerProfileDto): Promise<FreelancerProfileView> {
    BidPolicy.assertActorMayPerformFreelancerWrites(actor);
    assertUpdatePayload(dto);

    const current = await db.freelancerProfile.findFirst({
      where: { userId: actor.userId, deletedAt: null }
    });
    if (!current) {
      throw new NotFoundError("Freelancer profile not found");
    }

    if (dto.username !== undefined && dto.username.toLowerCase() !== current.username.toLowerCase()) {
      const usernameTaken = await db.freelancerProfile.findFirst({
        where: {
          username: { equals: dto.username, mode: "insensitive" },
          deletedAt: null,
          NOT: { id: current.id }
        }
      });
      if (usernameTaken) {
        throw new DomainError("Username is already in use", "USERNAME_TAKEN", 409);
      }
    }

    const row = await db.freelancerProfile.update({
      where: { id: current.id },
      data: {
        ...(dto.username !== undefined ? { username: dto.username } : {}),
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(dto.headline !== undefined ? { headline: dto.headline } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.workMode !== undefined ? { workMode: dto.workMode as FreelancerProfile["workMode"] } : {}),
        ...(dto.availabilityStatus !== undefined
          ? { availabilityStatus: dto.availabilityStatus as FreelancerProfile["availabilityStatus"] }
          : {})
      }
    });

    return mapFreelancerProfile(row);
  }

  async updateAvailability(actor: AuthActor, availabilityStatus: AvailabilityStatus): Promise<FreelancerProfileView> {
    return this.updateProfile(actor, { availabilityStatus });
  }
}
