export class DomainError extends Error {
  constructor(message: string, public readonly code: string, public readonly status = 400) {
    super(message);
  }
}

export class PolicyDeniedError extends DomainError {
  constructor(message = "Action is not allowed") {
    super(message, "POLICY_DENIED", 403);
  }
}

export class QuotaExceededError extends DomainError {
  constructor(message: string) {
    super(message, "QUOTA_EXCEEDED", 409);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Resource not found") {
    super(message, "NOT_FOUND", 404);
  }
}
