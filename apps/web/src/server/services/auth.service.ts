import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db, type Prisma } from "@acme/database";
import type { LoginDto, RegisterDto } from "@acme/validators";
import { AccountStatus, UserRole } from "@acme/types";
import { DomainError } from "@/server/errors/domain-errors";
import type { AuthActor } from "@/server/domain/auth-actor";
import {
  signSessionToken,
  getSessionFromRequest,
  type SessionPayload
} from "@src/lib/session";

function emailLocalPart(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "user";
  const safe = local.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24);
  return safe.length ? safe : "user";
}

function uniqueUsernameStub(email: string): string {
  const base = emailLocalPart(email);
  const suffix = randomBytes(3).toString("hex");
  return `${base}_${suffix}`.slice(0, 32);
}

export type PublicSessionDto = {
  userId: string;
  role: import("@acme/types").UserRole;
  accountStatus: import("@acme/types").AccountStatus;
};

export class AuthService {
  /** Resolve the signed session from the incoming request (cookie). No header fallbacks. */
  async resolveSession(request: Request): Promise<SessionPayload | null> {
    return getSessionFromRequest(request);
  }

  /** Map verified session to the API actor shape. */
  sessionToActor(session: SessionPayload): AuthActor {
    return {
      userId: session.userId,
      role: session.role as AuthActor["role"],
      accountStatus: session.accountStatus as AuthActor["accountStatus"]
    };
  }

  async issueSessionToken(user: {
    id: string;
    role: UserRole;
    accountStatus: AccountStatus;
  }): Promise<string> {
    const token = await signSessionToken({
      userId: user.id,
      role: user.role as SessionPayload["role"],
      accountStatus: user.accountStatus as SessionPayload["accountStatus"]
    });
    if (!token) {
      throw new DomainError("Server session is not configured", "SESSION_CONFIG", 500);
    }
    return token;
  }

  async register(input: RegisterDto): Promise<{ token: string; session: PublicSessionDto }> {
    const existing = await db.user.findFirst({
      where: { email: input.email.toLowerCase(), deletedAt: null }
    });
    if (existing) {
      throw new DomainError("An account with this email already exists", "EMAIL_IN_USE", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const email = input.email.toLowerCase();
    const role = input.role === "CLIENT" ? UserRole.CLIENT : UserRole.FREELANCER;
    const display = emailLocalPart(email);
    const username = uniqueUsernameStub(email);

    const user = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const u = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          accountStatus: AccountStatus.ACTIVE
        }
      });
      if (role === UserRole.CLIENT) {
        await tx.clientProfile.create({
          data: {
            userId: u.id,
            displayName: display
          }
        });
      } else {
        await tx.freelancerProfile.create({
          data: {
            userId: u.id,
            username,
            fullName: display
          }
        });
      }
      return u;
    });

    const token = await this.issueSessionToken({
      id: user.id,
      role: user.role as UserRole,
      accountStatus: user.accountStatus as AccountStatus
    });
    return {
      token,
      session: {
        userId: user.id,
        role: user.role as PublicSessionDto["role"],
        accountStatus: user.accountStatus as PublicSessionDto["accountStatus"]
      }
    };
  }

  async login(input: LoginDto): Promise<{ token: string; session: PublicSessionDto }> {
    const user = await db.user.findFirst({
      where: { email: input.email.toLowerCase(), deletedAt: null }
    });
    if (!user?.passwordHash) {
      throw new DomainError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new DomainError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    const token = await this.issueSessionToken({
      id: user.id,
      role: user.role as UserRole,
      accountStatus: user.accountStatus as AccountStatus
    });
    return {
      token,
      session: {
        userId: user.id,
        role: user.role as PublicSessionDto["role"],
        accountStatus: user.accountStatus as PublicSessionDto["accountStatus"]
      }
    };
  }

  async logout(): Promise<void> {
    /* Cookie cleared by the route handler; nothing server-side to revoke without a session store. */
  }

  async getSession(session: SessionPayload): Promise<PublicSessionDto> {
    return {
      userId: session.userId,
      role: session.role,
      accountStatus: session.accountStatus
    };
  }
}
