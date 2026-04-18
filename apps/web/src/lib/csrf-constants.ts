/** Readable by JS (not HttpOnly) for double-submit CSRF pattern. */
export const NW_CSRF_COOKIE_NAME = "acme_csrf";

/** Send this header on state-changing requests; must match the cookie value. */
export const NW_CSRF_HEADER_NAME = "X-CSRF-Token";
