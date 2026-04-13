import type { Route } from "next";
import Link from "next/link";
import { Bell, SlidersHorizontal, User } from "lucide-react";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";

export function AccountSettingsSection() {
  return (
    <section aria-labelledby="settings-account-heading">
      <SettingsSectionCard
        icon={User}
        title="Account"
        description="Your NearWork identity—sign-in, security, and billing—centralized for every role you use on the platform."
        headingId="settings-account-heading"
      >
        <ul className="space-y-2.5 text-sm leading-relaxed text-slate-600">
          <li className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300" aria-hidden />
            <span>
              <span className="font-medium text-slate-800">Profile & visibility</span> — how you appear across
              client and freelancer experiences.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300" aria-hidden />
            <span>
              <span className="font-medium text-slate-800">Security</span> — password, sessions, and
              sign-in methods.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-300" aria-hidden />
            <span>
              <span className="font-medium text-slate-800">Billing</span> — subscriptions and invoices
              when connected to a payment provider.
            </span>
          </li>
        </ul>
        <p className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-500">
          Early access: wire to profile and security endpoints; no changes are persisted from this screen yet.
        </p>
      </SettingsSectionCard>
    </section>
  );
}

export function PreferencesSettingsSection() {
  return (
    <section aria-labelledby="settings-preferences-heading">
      <SettingsSectionCard
        icon={SlidersHorizontal}
        title="Workspace preferences"
        description="Defaults, digests, and how NearWork surfaces updates while you hire or work with clients."
        headingId="settings-preferences-heading"
      >
        <div className="space-y-4 text-sm leading-relaxed text-slate-600">
          <p>
            Email digests, theme, and locale will land here. For now, time-sensitive updates still arrive in
            your notification center.
          </p>
          <Link
            href={"/notifications" as Route}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Bell className="h-4 w-4 text-[#3525cd]" aria-hidden />
            Open notifications
          </Link>
        </div>
        <p className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-500">
          Preference persistence is not hooked up yet—this card is a preview of the layout only.
        </p>
      </SettingsSectionCard>
    </section>
  );
}
