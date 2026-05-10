import { describe, expect, it } from "vitest";
import {
  isUnprefixedWorkspacePath,
  matchPrefixedWorkspacePath,
  pathnameForWorkspaceNavMatch,
  stripLeadingLocaleFromWorkspacePath,
  withWorkspaceLocale
} from "./workspace-path";

describe("workspace-path", () => {
  it("withWorkspaceLocale prefixes workspace roots only", () => {
    expect(withWorkspaceLocale("en", "/client")).toBe("/en/client");
    expect(withWorkspaceLocale("id", "/messages?thread=1")).toBe("/id/messages?thread=1");
    expect(withWorkspaceLocale("en", "/jobs")).toBe("/jobs");
  });

  it("pathnameForWorkspaceNavMatch strips locale prefix for workspace", () => {
    expect(pathnameForWorkspaceNavMatch("/id/client/jobs")).toBe("/client/jobs");
    expect(pathnameForWorkspaceNavMatch("/en/settings")).toBe("/settings");
    expect(pathnameForWorkspaceNavMatch("/id/how-it-works")).toBe("/id/how-it-works");
  });

  it("stripLeadingLocaleFromWorkspacePath matches pathname helper", () => {
    expect(stripLeadingLocaleFromWorkspacePath("/en/freelancer/profile")).toBe("/freelancer/profile");
  });

  it("matchPrefixedWorkspacePath parses locale and internal path", () => {
    expect(matchPrefixedWorkspacePath("/id/messages")).toEqual({
      locale: "id",
      internalPath: "/messages"
    });
  });

  it("isUnprefixedWorkspacePath detects bare workspace URLs", () => {
    expect(isUnprefixedWorkspacePath("/client")).toBe(true);
    expect(isUnprefixedWorkspacePath("/freelancer/profile")).toBe(true);
    expect(isUnprefixedWorkspacePath("/id/client")).toBe(false);
    expect(isUnprefixedWorkspacePath("/jobs")).toBe(false);
  });
});
