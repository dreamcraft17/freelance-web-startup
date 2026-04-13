import {
  AccountSettingsSection,
  PreferencesSettingsSection
} from "@/components/settings/SettingsOverviewSections";
import { SettingsCompanyProfileSection } from "@/components/settings/SettingsCompanyProfileSection";
import { SettingsSupportBlock } from "@/components/settings/SettingsSupportBlock";
import { SavedListsSection } from "./saved-lists";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-14">
      <header className="border-b border-slate-200/80 pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">NearWork</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          Your account, company profile, saved hiring lists, and preferences—organized like a product workspace, not a
          long form.
        </p>
      </header>

      <div className="space-y-10">
        <AccountSettingsSection />

        <SettingsCompanyProfileSection />

        <div className="space-y-4">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Hiring lists</p>
              <p className="mt-0.5 text-sm text-slate-600">Bookmarks you can revisit anytime</p>
            </div>
          </div>
          <SavedListsSection />
        </div>

        <PreferencesSettingsSection />

        <SettingsSupportBlock />
      </div>
    </div>
  );
}
