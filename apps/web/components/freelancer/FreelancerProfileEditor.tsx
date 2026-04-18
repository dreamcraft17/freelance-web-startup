"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { AvailabilityStatus, WorkMode } from "@acme/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Loader2, MapPin, Sparkles, User } from "lucide-react";

export type FreelancerProfileEditorSkill = {
  name: string;
  categoryName: string | null;
};

export type FreelancerProfileEditorInitial = {
  username: string;
  fullName: string;
  headline: string;
  bio: string;
  workMode: WorkMode;
  availabilityStatus: AvailabilityStatus;
  profileCompleteness: number;
};

type FreelancerProfileEditorProps = {
  mode: "create" | "edit";
  initial: FreelancerProfileEditorInitial | null;
  skills: FreelancerProfileEditorSkill[];
  location: { city: string | null; region: string | null; country: string | null };
  portfolioCount: number;
};

const workModeOptions: { value: WorkMode; label: string }[] = [
  { value: WorkMode.REMOTE, label: "Remote" },
  { value: WorkMode.HYBRID, label: "Hybrid" },
  { value: WorkMode.ONSITE, label: "On-site" }
];

const availabilityOptions: { value: AvailabilityStatus; label: string }[] = [
  { value: AvailabilityStatus.AVAILABLE, label: "Available" },
  { value: AvailabilityStatus.LIMITED, label: "Limited availability" },
  { value: AvailabilityStatus.UNAVAILABLE, label: "Unavailable" },
  { value: AvailabilityStatus.ON_LEAVE, label: "On leave" }
];

const inputClass =
  "flex min-h-[9rem] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

function snapshotFromInitial(initial: FreelancerProfileEditorInitial | null): FreelancerProfileEditorInitial {
  if (initial) return { ...initial };
  return {
    username: "",
    fullName: "",
    headline: "",
    bio: "",
    workMode: WorkMode.REMOTE,
    availabilityStatus: AvailabilityStatus.AVAILABLE,
    profileCompleteness: 0
  };
}

function isSame(a: FreelancerProfileEditorInitial, b: FreelancerProfileEditorInitial): boolean {
  return (
    a.username === b.username &&
    a.fullName === b.fullName &&
    a.headline === b.headline &&
    a.bio === b.bio &&
    a.workMode === b.workMode &&
    a.availabilityStatus === b.availabilityStatus
  );
}

export function FreelancerProfileEditor({
  mode,
  initial,
  skills,
  location,
  portfolioCount
}: FreelancerProfileEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FreelancerProfileEditorInitial>(() => snapshotFromInitial(initial));
  const [saved, setSaved] = useState<FreelancerProfileEditorInitial>(() => snapshotFromInitial(initial));
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const dirty = useMemo(() => !isSame(form, saved), [form, saved]);
  const completeness = form.profileCompleteness;
  const isIncomplete = mode === "edit" && completeness < 100;

  const applyServerProfile = useCallback((data: Record<string, unknown>) => {
    const next: FreelancerProfileEditorInitial = {
      username: String(data.username ?? ""),
      fullName: String(data.fullName ?? ""),
      headline: String(data.headline ?? ""),
      bio: String(data.bio ?? ""),
      workMode: (data.workMode as WorkMode) ?? WorkMode.REMOTE,
      availabilityStatus: (data.availabilityStatus as AvailabilityStatus) ?? AvailabilityStatus.AVAILABLE,
      profileCompleteness: typeof data.profileCompleteness === "number" ? data.profileCompleteness : 0
    };
    setForm(next);
    setSaved(next);
  }, []);

  const submit = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        if (mode === "create") {
          const body = {
            username: form.username.trim(),
            fullName: form.fullName.trim(),
            workMode: form.workMode,
            ...(form.headline.trim() ? { headline: form.headline.trim() } : {}),
            ...(form.bio.trim() ? { bio: form.bio.trim() } : {})
          };
          const res = await fetchWithCsrf("/api/freelancer-profiles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          const json = (await res.json()) as { success?: boolean; data?: Record<string, unknown>; error?: string };
          if (!res.ok || !json.success) {
            setMessage({ type: "err", text: json.error ?? "Could not create profile" });
            return;
          }
          if (json.data) applyServerProfile(json.data);
          setMessage({ type: "ok", text: "Profile created." });
          router.refresh();
          return;
        }

        const patch: Record<string, string> = {};
        if (form.username !== saved.username) patch.username = form.username.trim();
        if (form.fullName !== saved.fullName) patch.fullName = form.fullName.trim();
        if (form.headline !== saved.headline) patch.headline = form.headline.trim();
        if (form.bio !== saved.bio) patch.bio = form.bio.trim();
        if (form.workMode !== saved.workMode) patch.workMode = form.workMode;
        if (form.availabilityStatus !== saved.availabilityStatus) patch.availabilityStatus = form.availabilityStatus;

        if (Object.keys(patch).length === 0) {
          setMessage({ type: "err", text: "Change something before saving, or everything is already up to date." });
          return;
        }

        const res = await fetchWithCsrf("/api/freelancer-profiles", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch)
        });
        const json = (await res.json()) as { success?: boolean; data?: Record<string, unknown>; error?: string };
        if (!res.ok || !json.success) {
          setMessage({ type: "err", text: json.error ?? "Could not update profile" });
          return;
        }
        if (json.data) applyServerProfile(json.data);
        setMessage({ type: "ok", text: "Profile updated." });
        router.refresh();
      } catch {
        setMessage({ type: "err", text: "Network error. Try again." });
      }
    });
  };

  const locationLine = [location.city, location.region, location.country].filter(Boolean).join(", ");

  const sectionCardTitle = "text-base font-semibold tracking-tight text-slate-900";
  const sectionCardDesc = "text-sm text-slate-600";

  return (
    <div className="space-y-6">
      {isIncomplete ? (
        <div className="flex flex-col gap-3 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/40 p-4 shadow-sm ring-1 ring-indigo-100/60 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3525cd] text-white shadow-sm">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Complete your profile</p>
              <p className="mt-0.5 text-sm text-slate-600">
                You are at <span className="font-semibold text-[#3525cd]">{completeness}%</span>.
                Add headline, bio, and clear work preferences so clients hire with confidence.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 border-[#3525cd]/30 text-[#3525cd] hover:bg-[#3525cd]/10"
            onClick={() => document.getElementById("section-headline")?.scrollIntoView({ behavior: "smooth" })}
          >
            Fill in details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-xl border-slate-200/90 shadow-sm shadow-slate-900/[0.04]">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-[#3525cd] ring-1 ring-slate-200/90">
              <User className="h-8 w-8" strokeWidth={1.5} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className={cn(sectionCardTitle, "text-lg md:text-xl")}>Profile</CardTitle>
              <CardDescription className="mt-1 text-slate-600">
                {mode === "create"
                  ? "Create your freelancer identity. You can refine everything later."
                  : "This is what powers proposals and your public NearWork presence."}
              </CardDescription>
              {mode === "edit" && form.username ? (
                <p className="mt-2 text-sm">
                  <Link
                    href={`/freelancers/${form.username}` as Route}
                    className="font-medium text-[#3525cd] underline-offset-4 hover:underline"
                  >
                    View public profile
                  </Link>
                </p>
              ) : null}
            </div>
            {mode === "edit" ? (
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-center sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Completion</p>
                <p className="text-2xl font-semibold tabular-nums text-[#3525cd]">{form.profileCompleteness}%</p>
              </div>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-xl border-slate-200/90 shadow-sm shadow-slate-900/[0.04]">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className={sectionCardTitle}>Basic info</CardTitle>
          <CardDescription className={sectionCardDesc}>How clients see your name and @handle on NearWork.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fp-fullName">Full name</Label>
              <Input
                id="fp-fullName"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                autoComplete="name"
                placeholder="Alex Morgan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fp-username">Username</Label>
              <Input
                id="fp-username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                autoComplete="username"
                placeholder="alexm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="section-headline" className="rounded-xl border-slate-200/90 shadow-sm shadow-slate-900/[0.04]">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className={sectionCardTitle}>Headline & bio</CardTitle>
          <CardDescription className={sectionCardDesc}>
            A sharp headline and short bio help you stand out in search and proposals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="fp-headline">Headline</Label>
            <Input
              id="fp-headline"
              value={form.headline}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              placeholder="Senior product designer · design systems · B2B SaaS"
              maxLength={180}
            />
            <p className="text-xs text-slate-500">{form.headline.length}/180</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fp-bio">Bio</Label>
            <textarea
              id="fp-bio"
              className={inputClass}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="What you do, who you like to work with, and how you deliver."
              maxLength={3000}
            />
            <p className="text-xs text-slate-500">{form.bio.length}/3000</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200/90 shadow-sm shadow-slate-900/[0.04]">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className={sectionCardTitle}>Location & work mode</CardTitle>
          <CardDescription className={sectionCardDesc}>
            Work mode is saved with your profile. Location is shown on your public profile when set.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="fp-workMode">Work mode</Label>
            <select
              id="fp-workMode"
              className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.workMode}
              onChange={(e) => setForm((f) => ({ ...f, workMode: e.target.value as WorkMode }))}
            >
              {workModeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location on file</p>
                <p className="mt-1 text-sm text-slate-700">
                  {locationLine || "No city or region on file yet."}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Location fields are not editable in this form yet; they stay in sync with your account data.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {mode === "edit" ? (
        <Card className="rounded-xl border-slate-200/90 shadow-sm shadow-slate-900/[0.04]">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className={sectionCardTitle}>Availability</CardTitle>
            <CardDescription className={sectionCardDesc}>
              Let clients know if you are taking new work. This is saved with your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-2">
              <Label htmlFor="fp-availability">Status</Label>
              <select
                id="fp-availability"
                className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.availabilityStatus}
                onChange={(e) =>
                  setForm((f) => ({ ...f, availabilityStatus: e.target.value as AvailabilityStatus }))
                }
              >
                {availabilityOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-xl border-slate-200/90 shadow-sm shadow-slate-900/[0.04]">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className={sectionCardTitle}>Skills & categories</CardTitle>
          <CardDescription className={sectionCardDesc}>
            Skills linked to your profile (read-only here). Editing skills from the profile editor is coming next.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          {skills.length === 0 ? (
            <p className="text-sm text-slate-600">
              No skills on your profile yet. When your workspace supports skill tags, they will appear here.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <li
                  key={`${s.name}-${s.categoryName ?? ""}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-sm"
                >
                  {s.name}
                  {s.categoryName ? (
                    <span className="ml-1 text-slate-500">· {s.categoryName}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200/90 shadow-sm shadow-slate-900/[0.04]">
        <CardHeader className="pb-3 pt-5">
          <CardTitle className={sectionCardTitle}>Portfolio</CardTitle>
          <CardDescription className={sectionCardDesc}>
            Showcase work samples on your public profile. Uploads will live here.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-800">
              {portfolioCount === 0 ? "No portfolio pieces yet" : `${portfolioCount} piece${portfolioCount === 1 ? "" : "s"} on file`}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Portfolio management is not wired to this page yet. When it is, you will add images and case studies
              without leaving NearWork.
            </p>
          </div>
        </CardContent>
      </Card>

      <div
        className={cn(
          "sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white/95 p-4 shadow-lg shadow-slate-900/[0.08] backdrop-blur sm:flex-row sm:items-center sm:justify-between",
          dirty ? "ring-1 ring-[#3525cd]/15" : ""
        )}
      >
        <div className="min-w-0 text-sm text-slate-600">
          {message?.type === "ok" ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
              <Check className="h-4 w-4" aria-hidden />
              {message.text}
            </span>
          ) : message?.type === "err" ? (
            <span className="font-medium text-red-700">{message.text}</span>
          ) : mode === "edit" ? (
            <span>{dirty ? "You have unsaved changes." : "All changes saved."}</span>
          ) : (
            <span>Fill required fields, then create your profile.</span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {mode === "edit" ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPending || !dirty}
              onClick={() => {
                setForm({ ...saved });
                setMessage(null);
              }}
            >
              Reset
            </Button>
          ) : null}
          <Button
            type="button"
            className="min-w-[9rem] bg-[#3525cd] text-white hover:bg-[#2d1fb0]"
            disabled={
              isPending ||
              (mode === "create"
                ? !form.username.trim() || !form.fullName.trim()
                : !dirty)
            }
            onClick={submit}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : mode === "create" ? (
              "Create profile"
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
