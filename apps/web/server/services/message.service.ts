import { db } from "@acme/database";
import { AccountStatus, JobStatus } from "@acme/types";
import type { AuthActor } from "../domain/auth-actor";
import type { CreateMessageThreadDto, PostMessageDto } from "@acme/validators";
import { NotFoundError, PolicyDeniedError } from "../errors/domain-errors";

export class MessageService {
  private async assertClientFreelancerPair(clientUserId: string, freelancerUserId: string) {
    const [clientUser, freelancerUser] = await Promise.all([
      db.user.findFirst({
        where: { id: clientUserId, deletedAt: null, accountStatus: AccountStatus.ACTIVE },
        select: { clientProfile: { select: { id: true } } }
      }),
      db.user.findFirst({
        where: { id: freelancerUserId, deletedAt: null, accountStatus: AccountStatus.ACTIVE },
        select: { freelancerProfile: { select: { id: true } } }
      })
    ]);
    if (!clientUser?.clientProfile) {
      throw new PolicyDeniedError("Client profile is required on the client side of this conversation");
    }
    if (!freelancerUser?.freelancerProfile) {
      throw new PolicyDeniedError("Freelancer profile is required on the freelancer side of this conversation");
    }
  }

  private async assertParticipant(actor: AuthActor, threadId: string) {
    const thread = await db.messageThread.findFirst({
      where: { id: threadId },
      select: { id: true }
    });
    if (!thread) throw new NotFoundError("Thread not found");

    const membership = await db.messageThreadParticipant.findFirst({
      where: { threadId, userId: actor.userId },
      select: { id: true }
    });
    if (!membership) throw new PolicyDeniedError("You are not a participant in this thread");
  }

  private async findTwoParticipantThread(params: {
    type: "DIRECT" | "JOB" | "CONTRACT";
    userA: string;
    userB: string;
    jobId?: string | null;
    contractId?: string | null;
  }) {
    const { type, userA, userB, jobId, contractId } = params;
    const whereBase =
      type === "CONTRACT"
        ? { type: "CONTRACT" as const, contractId: contractId!, jobId: null as string | null }
        : type === "JOB"
          ? { type: "JOB" as const, jobId: jobId!, contractId: null as string | null }
          : { type: "DIRECT" as const, jobId: null as string | null, contractId: null as string | null };

    const threads = await db.messageThread.findMany({
      where: {
        ...whereBase,
        AND: [
          { participants: { some: { userId: userA } } },
          { participants: { some: { userId: userB } } }
        ]
      },
      include: { _count: { select: { participants: true } } }
    });
    return threads.find((t) => t._count.participants === 2) ?? null;
  }

  async createThread(actor: AuthActor, input: CreateMessageThreadDto) {
    if (input.type === "DIRECT") {
      const withUserId = input.withUserId as string;
      if (withUserId === actor.userId) {
        throw new PolicyDeniedError("You cannot start a thread with yourself");
      }
      const [actorProfiles, otherProfiles] = await Promise.all([
        db.user.findFirst({
          where: { id: actor.userId, deletedAt: null, accountStatus: AccountStatus.ACTIVE },
          select: {
            clientProfile: { select: { id: true } },
            freelancerProfile: { select: { id: true } }
          }
        }),
        db.user.findFirst({
          where: { id: withUserId, deletedAt: null, accountStatus: AccountStatus.ACTIVE },
          select: {
            clientProfile: { select: { id: true } },
            freelancerProfile: { select: { id: true } }
          }
        })
      ]);
      if (!actorProfiles || !otherProfiles) throw new NotFoundError("User not found");

      const actorIsClient = !!actorProfiles.clientProfile;
      const actorIsFreelancer = !!actorProfiles.freelancerProfile;
      const otherIsClient = !!otherProfiles.clientProfile;
      const otherIsFreelancer = !!otherProfiles.freelancerProfile;
      const validPair =
        (actorIsClient && otherIsFreelancer) || (actorIsFreelancer && otherIsClient);
      if (!validPair) {
        throw new PolicyDeniedError("Direct messages are only between a client account and a freelancer account");
      }

      const existing = await this.findTwoParticipantThread({
        type: "DIRECT",
        userA: actor.userId,
        userB: withUserId
      });
      if (existing) {
        return { threadId: existing.id, created: false as const };
      }

      const thread = await db.$transaction(async (tx) => {
        const t = await tx.messageThread.create({
          data: { type: "DIRECT", jobId: null, contractId: null }
        });
        await tx.messageThreadParticipant.createMany({
          data: [
            { threadId: t.id, userId: actor.userId },
            { threadId: t.id, userId: withUserId }
          ]
        });
        return t;
      });
      return { threadId: thread.id, created: true as const };
    }

    if (input.type === "JOB") {
      const jobId = input.jobId as string;
      const withUserId = input.withUserId as string;
      if (withUserId === actor.userId) {
        throw new PolicyDeniedError("You cannot start a thread with yourself");
      }

      const job = await db.job.findFirst({
        where: { id: jobId, deletedAt: null },
        select: {
          id: true,
          status: true,
          clientProfile: { select: { userId: true } }
        }
      });
      if (!job) throw new NotFoundError("Job not found");
      if (job.status !== JobStatus.OPEN) {
        throw new PolicyDeniedError("You can only message about open jobs");
      }

      const ownerUserId = job.clientProfile.userId;
      const pair = new Set([actor.userId, withUserId]);
      if (!pair.has(ownerUserId) || pair.size !== 2) {
        throw new PolicyDeniedError("Job threads must include the job owner and the other participant you specify");
      }

      const freelancerUserId = actor.userId === ownerUserId ? withUserId : actor.userId;
      await this.assertClientFreelancerPair(ownerUserId, freelancerUserId);

      const existing = await this.findTwoParticipantThread({
        type: "JOB",
        userA: ownerUserId,
        userB: freelancerUserId,
        jobId,
        contractId: null
      });
      if (existing) {
        return { threadId: existing.id, created: false as const };
      }

      const thread = await db.$transaction(async (tx) => {
        const t = await tx.messageThread.create({
          data: { type: "JOB", jobId, contractId: null }
        });
        await tx.messageThreadParticipant.createMany({
          data: [
            { threadId: t.id, userId: ownerUserId },
            { threadId: t.id, userId: freelancerUserId }
          ]
        });
        return t;
      });
      return { threadId: thread.id, created: true as const };
    }

    if (input.type === "CONTRACT") {
      const contractId = input.contractId as string;
      const contract = await db.contract.findFirst({
        where: { id: contractId, deletedAt: null },
        select: { id: true, freelancerUserId: true, clientUserId: true }
      });
      if (!contract) throw new NotFoundError("Contract not found");

      const allowed = new Set([contract.freelancerUserId, contract.clientUserId]);
      if (!allowed.has(actor.userId)) {
        throw new PolicyDeniedError("Only contract parties can open this thread");
      }

      const a = contract.freelancerUserId;
      const b = contract.clientUserId;

      const existing = await this.findTwoParticipantThread({
        type: "CONTRACT",
        userA: a,
        userB: b,
        contractId
      });
      if (existing) {
        return { threadId: existing.id, created: false as const };
      }

      const thread = await db.$transaction(async (tx) => {
        const t = await tx.messageThread.create({
          data: { type: "CONTRACT", jobId: null, contractId }
        });
        await tx.messageThreadParticipant.createMany({
          data: [
            { threadId: t.id, userId: a },
            { threadId: t.id, userId: b }
          ]
        });
        return t;
      });
      return { threadId: thread.id, created: true as const };
    }

    throw new PolicyDeniedError("Unsupported thread type");
  }

  async listThreadsForActor(actor: AuthActor) {
    const rows = await db.messageThreadParticipant.findMany({
      where: { userId: actor.userId },
      orderBy: { thread: { updatedAt: "desc" } },
      select: {
        thread: {
          select: {
            id: true,
            type: true,
            jobId: true,
            contractId: true,
            updatedAt: true,
            participants: {
              select: {
                userId: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    clientProfile: { select: { displayName: true } },
                    freelancerProfile: { select: { fullName: true, username: true } }
                  }
                }
              }
            },
            messages: {
              where: { deletedAt: null },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true, body: true, createdAt: true, senderId: true }
            }
          }
        }
      }
    });

    const labelFor = (u: (typeof rows)[number]["thread"]["participants"][number]["user"]) => {
      if (u.clientProfile?.displayName) return u.clientProfile.displayName;
      if (u.freelancerProfile?.username) return `@${u.freelancerProfile.username}`;
      if (u.freelancerProfile?.fullName) return u.freelancerProfile.fullName;
      return u.email;
    };

    return {
      items: rows.map(({ thread }) => {
        const last = thread.messages[0];
        const peers = thread.participants
          .filter((p) => p.userId !== actor.userId)
          .map((p) => ({
            userId: p.userId,
            displayName: labelFor(p.user)
          }));
        return {
          threadId: thread.id,
          type: thread.type,
          jobId: thread.jobId,
          contractId: thread.contractId,
          updatedAt: thread.updatedAt.toISOString(),
          peers,
          lastMessage: last
            ? {
                id: last.id,
                body: last.body,
                createdAt: last.createdAt.toISOString(),
                senderId: last.senderId
              }
            : null
        };
      })
    };
  }

  async listMessagesForActor(actor: AuthActor, threadId: string) {
    await this.assertParticipant(actor, threadId);

    const messages = await db.message.findMany({
      where: { threadId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        body: true,
        createdAt: true,
        senderId: true,
        isSystem: true
      }
    });

    return {
      threadId,
      items: messages.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        senderId: m.senderId,
        isSystem: m.isSystem
      }))
    };
  }

  async postMessage(actor: AuthActor, threadId: string, input: PostMessageDto) {
    await this.assertParticipant(actor, threadId);

    const message = await db.$transaction(async (tx) => {
      const m = await tx.message.create({
        data: {
          threadId,
          senderId: actor.userId,
          body: input.body,
          isSystem: false
        },
        select: {
          id: true,
          body: true,
          createdAt: true,
          senderId: true,
          isSystem: true
        }
      });
      await tx.messageThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() }
      });
      return m;
    });

    return {
      id: message.id,
      threadId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId,
      isSystem: message.isSystem
    };
  }
}
