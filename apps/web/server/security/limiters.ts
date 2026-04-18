import { SlidingWindowRateLimiter } from "./sliding-window-limiter";

/** POST /api/auth/login — per IP, requests per minute */
export const authLoginIpLimiter = new SlidingWindowRateLimiter();

/** POST /api/auth/register — per IP */
export const authRegisterIpLimiter = new SlidingWindowRateLimiter();

/** Public GET discovery (search, job list, public profile by username) */
export const publicReadIpLimiter = new SlidingWindowRateLimiter();

/** GET /api/search/* and GET /api/jobs list — tuned separately from generic public reads */
export const publicDiscoveryIpLimiter = new SlidingWindowRateLimiter();

/** Same IP + stable query fingerprint (excludes page) — curbs enumeration / crawl bursts */
export const publicDiscoveryEnumerationLimiter = new SlidingWindowRateLimiter();

/** Extra ceiling for high scrape-signal clients (non-indexer UAs) */
export const suspiciousPublicDiscoveryLimiter = new SlidingWindowRateLimiter();

/** Authenticated reads (messages list, thread messages) */
export const authenticatedReadUserLimiter = new SlidingWindowRateLimiter();

/** POST new message thread */
export const messageCreateUserLimiter = new SlidingWindowRateLimiter();

/** POST message in thread */
export const messagePostUserLimiter = new SlidingWindowRateLimiter();

/** POST bid */
export const bidPostUserLimiter = new SlidingWindowRateLimiter();

/** POST create job draft */
export const jobCreateUserLimiter = new SlidingWindowRateLimiter();

/** POST review */
export const reviewPostUserLimiter = new SlidingWindowRateLimiter();

/** Staff PATCH verification */
export const staffVerificationPatchUserLimiter = new SlidingWindowRateLimiter();

/** Mutations per IP (layer under user limits) */
export const sensitiveMutateIpLimiter = new SlidingWindowRateLimiter();

/** Freelancer profile POST (create) */
export const freelancerProfileCreateUserLimiter = new SlidingWindowRateLimiter();

/** Freelancer profile PATCH */
export const freelancerProfilePatchUserLimiter = new SlidingWindowRateLimiter();

/** Client profile POST (create) */
export const clientProfileCreateUserLimiter = new SlidingWindowRateLimiter();

/** Saved jobs POST/DELETE per user */
export const savedJobsMutateUserLimiter = new SlidingWindowRateLimiter();

/** Saved freelancers POST/DELETE per user */
export const savedFreelancersMutateUserLimiter = new SlidingWindowRateLimiter();

/** Freelancer verification requests */
export const verificationFreelancerUserLimiter = new SlidingWindowRateLimiter();

/** Client PATCH job */
export const jobUpdateUserLimiter = new SlidingWindowRateLimiter();
