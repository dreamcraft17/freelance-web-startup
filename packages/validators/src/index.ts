import { AvailabilityStatus } from "@acme/types";
import { z } from "zod";

/** Use `.extend()` (not object spread) so Zod keeps `page` / `limit` required on output. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const idParamSchema = z.object({
  id: z.string().min(1)
});

export const freelancerProfileUsernameQuerySchema = z.object({
  username: z.string().min(1).max(32)
});

export const createFreelancerProfileSchema = z.object({
  username: z.string().min(3).max(32),
  fullName: z.string().min(2).max(120),
  headline: z.string().max(180).optional(),
  bio: z.string().max(3000).optional(),
  workMode: z.enum(["REMOTE", "ONSITE", "HYBRID"])
});

/** Authenticated freelancer profile update (at least one field). */
export const updateFreelancerProfileSchema = createFreelancerProfileSchema
  .partial()
  .extend({
    availabilityStatus: z.nativeEnum(AvailabilityStatus).optional()
  })
  .superRefine((data, ctx) => {
    const keys = Object.keys(data).filter((k) => (data as Record<string, unknown>)[k] !== undefined);
    if (keys.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field is required",
        path: []
      });
    }
  });

export const createClientProfileSchema = z.object({
  displayName: z.string().min(2).max(120),
  companyName: z.string().max(180).optional(),
  industry: z.string().max(120).optional()
});

export const updateJobSchema = z
  .object({
    title: z.string().min(3).max(180).optional(),
    description: z.string().min(30).max(12000).optional(),
    status: z.enum(["DRAFT", "OPEN", "PAUSED", "CLOSED"]).optional()
  })
  .refine((d) => d.title !== undefined || d.description !== undefined || d.status !== undefined, {
    message: "At least one of title, description, or status is required"
  });

export const createJobSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(30).max(12000),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
  workMode: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
  budgetType: z.enum(["FIXED", "HOURLY", "RANGE", "REQUEST_QUOTE"]),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  currency: z.string().length(3),
  city: z.string().max(120).optional(),
  bidDeadline: z.string().datetime().optional()
});

export const submitBidSchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().min(30).max(4000),
  bidAmount: z.number().positive(),
  estimatedDays: z.number().int().positive().max(365)
});

export const createSubscriptionSchema = z.object({
  planCode: z.string().min(1),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"])
});

/** Mock-friendly donation intent; swap handler body for a real PSP later. */
export const createDonationSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  currency: z.string().length(3).default("USD"),
  message: z.string().max(500).optional()
});

/** Public discovery: deep pagination is expensive and scrape-prone */
export const MAX_PUBLIC_DISCOVERY_PAGE = 200;

const discoveryPageRefine = <T extends { page: number }>(data: T, ctx: z.RefinementCtx) => {
  if (data.page > MAX_PUBLIC_DISCOVERY_PAGE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Page is out of range for public discovery",
      path: ["page"]
    });
  }
};

export const searchFreelancersSchema = paginationSchema
  .extend({
    keyword: z.string().max(120).optional(),
    city: z.string().max(120).optional(),
    workMode: z.enum(["REMOTE", "ONSITE", "HYBRID"]).optional(),
    categoryId: z.string().max(48).optional(),
    skillId: z.string().max(48).optional()
  })
  .superRefine(discoveryPageRefine);

export const searchJobsSchema = paginationSchema
  .extend({
    keyword: z.string().max(120).optional(),
    city: z.string().max(120).optional(),
    workMode: z.enum(["REMOTE", "ONSITE", "HYBRID"]).optional(),
    categoryId: z.string().max(48).optional(),
    minBudget: z.coerce.number().min(0).optional(),
    maxBudget: z.coerce.number().min(0).optional(),
    postedWithinDays: z.coerce.number().int().min(1).max(30).optional()
  })
  .superRefine(discoveryPageRefine);

export const createVerificationRequestSchema = z.object({
  type: z.enum(["IDENTITY", "BUSINESS", "ADDRESS", "CERTIFICATION", "PAYMENT_METHOD"]),
  note: z.string().max(1000).optional(),
  /** Optional structured metadata (e.g. document URLs, refs). Stored as JSON; not a file upload. */
  evidence: z.record(z.string(), z.unknown()).optional()
});

export const createReviewSchema = z.object({
  contractId: z.string().min(1),
  targetType: z.enum(["CLIENT", "FREELANCER"]),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1500).optional()
});

export const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  role: z.enum(["CLIENT", "FREELANCER"])
});

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128)
});

export const saveJobBodySchema = z.object({
  jobId: z.string().min(1)
});

export const saveFreelancerBodySchema = z.object({
  freelancerProfileId: z.string().min(1)
});

export const createMessageThreadSchema = z
  .object({
    type: z.enum(["DIRECT", "JOB", "CONTRACT"]),
    /** Other party (user id). Required for DIRECT and JOB. */
    withUserId: z.string().min(1).optional(),
    jobId: z.string().min(1).optional(),
    contractId: z.string().min(1).optional()
  })
  .superRefine((data, ctx) => {
    if (data.type === "DIRECT") {
      if (!data.withUserId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["withUserId"],
          message: "withUserId is required for DIRECT threads"
        });
      }
    }
    if (data.type === "JOB") {
      if (!data.jobId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["jobId"], message: "jobId is required for JOB threads" });
      }
      if (!data.withUserId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["withUserId"],
          message: "withUserId is required for JOB threads"
        });
      }
    }
    if (data.type === "CONTRACT") {
      if (!data.contractId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contractId"],
          message: "contractId is required for CONTRACT threads"
        });
      }
    }
  });

export const postMessageSchema = z.object({
  body: z.string().min(1).max(20000)
});

export const staffReviewVerificationSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().max(2000).optional()
});

export const markNotificationReadBodySchema = z.object({
  read: z.literal(true)
});

const moderationCategories = ["spam", "harassment", "scam", "policy", "ip", "other"] as const;

export const createModerationReportSchema = z.discriminatedUnion("subjectType", [
  z.object({
    subjectType: z.literal("USER"),
    subjectUserId: z.string().min(1),
    category: z.enum(moderationCategories),
    description: z.string().min(10).max(8000)
  }),
  z.object({
    subjectType: z.literal("JOB"),
    subjectJobId: z.string().min(1),
    category: z.enum(moderationCategories),
    description: z.string().min(10).max(8000)
  }),
  z.object({
    subjectType: z.literal("BID"),
    subjectBidId: z.string().min(1),
    category: z.enum(moderationCategories),
    description: z.string().min(10).max(8000)
  }),
  z.object({
    subjectType: z.literal("REVIEW"),
    subjectReviewId: z.string().min(1),
    category: z.enum(moderationCategories),
    description: z.string().min(10).max(8000)
  }),
  z.object({
    subjectType: z.literal("MESSAGE_THREAD"),
    subjectThreadId: z.string().min(1),
    category: z.enum(moderationCategories),
    description: z.string().min(10).max(8000)
  }),
  z.object({
    subjectType: z.literal("MESSAGE"),
    subjectMessageId: z.string().min(1),
    category: z.enum(moderationCategories),
    description: z.string().min(10).max(8000)
  })
]);

export const patchModerationReportSchema = z
  .object({
    status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]).optional(),
    assignedToStaffUserId: z.union([z.string().min(1).max(64), z.null()]).optional(),
    resolutionSummary: z.string().max(2000).optional(),
    addNote: z.string().min(1).max(6000).optional()
  })
  .superRefine((data, ctx) => {
    const keys = ["status", "assignedToStaffUserId", "resolutionSummary", "addNote"] as const;
    const any = keys.some((k) => data[k] !== undefined);
    if (!any) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field is required",
        path: []
      });
    }
  });

export const addModerationReportNoteSchema = z.object({
  body: z.string().min(1).max(6000)
});

export const staffSetJobModerationSchema = z.object({
  hidden: z.boolean(),
  reason: z.string().max(2000).optional()
});

export const staffSetUserModerationSchema = z.object({
  accountStatus: z.enum(["ACTIVE", "SUSPENDED"])
});

export const adminReportsQuerySchema = paginationSchema.extend({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]).optional(),
  subjectType: z.enum(["USER", "JOB", "BID", "REVIEW", "MESSAGE_THREAD", "MESSAGE"]).optional(),
  assignedToStaffUserId: z.string().max(72).optional(),
  q: z.string().max(200).optional()
});

export const categoryListQuerySchema = paginationSchema.extend({
  parentSlug: z.string().optional()
});

export const skillListQuerySchema = paginationSchema.extend({
  categoryId: z.string().optional(),
  q: z.string().optional()
});

export type SubmitBidDto = z.infer<typeof submitBidSchema>;
export type CreateJobDto = z.infer<typeof createJobSchema>;
export type UpdateJobDto = z.infer<typeof updateJobSchema>;
export type CreateFreelancerProfileDto = z.infer<typeof createFreelancerProfileSchema>;
export type UpdateFreelancerProfileBodyDto = z.infer<typeof updateFreelancerProfileSchema>;
export type CreateClientProfileDto = z.infer<typeof createClientProfileSchema>;
export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;
export type CreateDonationDto = z.infer<typeof createDonationSchema>;
export type SearchFreelancersQueryDto = z.infer<typeof searchFreelancersSchema>;
export type SearchJobsQueryDto = z.infer<typeof searchJobsSchema>;
export type CreateVerificationRequestDto = z.infer<typeof createVerificationRequestSchema>;
export type CreateReviewDto = z.infer<typeof createReviewSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type SaveJobBodyDto = z.infer<typeof saveJobBodySchema>;
export type SaveFreelancerBodyDto = z.infer<typeof saveFreelancerBodySchema>;
export type CreateMessageThreadDto = z.infer<typeof createMessageThreadSchema>;
export type PostMessageDto = z.infer<typeof postMessageSchema>;
export type StaffReviewVerificationDto = z.infer<typeof staffReviewVerificationSchema>;
export type MarkNotificationReadBodyDto = z.infer<typeof markNotificationReadBodySchema>;
export type CategoryListQueryDto = z.infer<typeof categoryListQuerySchema>;
export type SkillListQueryDto = z.infer<typeof skillListQuerySchema>;
export type FreelancerProfileUsernameQueryDto = z.infer<typeof freelancerProfileUsernameQuerySchema>;
export type CreateModerationReportDto = z.infer<typeof createModerationReportSchema>;
export type PatchModerationReportDto = z.infer<typeof patchModerationReportSchema>;
export type StaffSetJobModerationDto = z.infer<typeof staffSetJobModerationSchema>;
export type StaffSetUserModerationDto = z.infer<typeof staffSetUserModerationSchema>;
export type AdminReportsQueryDto = z.infer<typeof adminReportsQuerySchema>;
