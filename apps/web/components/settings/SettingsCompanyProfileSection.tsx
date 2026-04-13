import Link from "next/link";
import type { Route } from "next";
import { db } from "@acme/database";
import { Building2 } from "lucide-react";
import { getSessionFromCookies } from "@src/lib/auth";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";

function areaLine(
  city: string | null,
  region: string | null,
  country: string | null
): string | null {
  const parts = [city?.trim(), region?.trim(), country?.trim()].filter(Boolean) as string[];
  if (parts.length === 0) return null;
  return parts.join(", ");
}

export async function SettingsCompanyProfileSection() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const profile = await db.clientProfile.findFirst({
    where: { userId: session.userId, deletedAt: null },
    select: {
      displayName: true,
      companyName: true,
      industry: true,
      city: true,
      region: true,
      country: true
    }
  });

  const location = profile ? areaLine(profile.city, profile.region, profile.country) : null;

  return (
    <section aria-labelledby="settings-company-heading">
      <SettingsSectionCard
        icon={Building2}
        title="Company & client profile"
        description="How you show up to freelancers when you post jobs, receive bids, and use nearby talent."
        headingId="settings-company-heading"
      >
        {profile ? (
          <>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Display name</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{profile.displayName}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Company</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {profile.companyName?.trim() ? profile.companyName : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Industry</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {profile.industry?.trim() ? profile.industry : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Location</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">{location ?? "—"}</dd>
              </div>
            </dl>
            <p className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
              Rich editing and verification status will live here when wired to your client profile API. Your data
              above is read-only from the database today.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={"/client" as Route}
                className="inline-flex items-center rounded-lg bg-[#3525cd] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d1fb0]"
              >
                Open client workspace
              </Link>
              <Link
                href={"/client/jobs" as Route}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                My jobs
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-slate-600">
              No client profile on file yet. Creating one unlocks posting jobs, receiving proposals, and
              location-aware discovery for your hiring.
            </p>
            <div className="mt-5 rounded-xl border border-slate-200/90 bg-slate-50/60 px-4 py-4">
              <p className="text-sm font-medium text-slate-800">Get started as a client</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Use your client dashboard to establish a workspace—profile fields will sync here automatically.
              </p>
              <Link
                href={"/client" as Route}
                className="mt-3 inline-flex items-center rounded-lg bg-[#3525cd] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d1fb0]"
              >
                Go to client dashboard
              </Link>
            </div>
          </>
        )}
      </SettingsSectionCard>
    </section>
  );
}
