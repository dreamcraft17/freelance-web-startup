import {
  AccountSettingsSection,
  PreferencesSettingsSection
} from "@/components/settings/SettingsOverviewSections";
import { SettingsCompanyProfileSection } from "@/components/settings/SettingsCompanyProfileSection";
import { SettingsSupportBlock } from "@/components/settings/SettingsSupportBlock";
import { AppealSuspensionPanel } from "@/components/design-system/AppealSuspensionPanel";
import { SubscriptionUpgradeModal } from "@/components/design-system/SubscriptionUpgradeModal";
import { SavedListsSection } from "./saved-lists";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12">
      <header className="border-b border-slate-200/80 pb-4">
        <p className="nw-type-micro">NextWork</p>
        <h1 className="nw-type-display mt-1.5 text-slate-900">Settings</h1>
        <p className="nw-type-body mt-2 max-w-xl">
          Your account, company profile, saved hiring lists, and preferences—organized like a product workspace, not a
          long form.
        </p>
      </header>

      <div className="space-y-8">
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

        <section aria-labelledby="settings-v2-heading" className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <p id="settings-v2-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              V2 workspace
            </p>
            <p className="mt-0.5 text-sm text-slate-600">Theme, subscription, and account appeals</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <SubscriptionUpgradeModal />
          </div>
          <AppealSuspensionPanel />
        </section>

        <SettingsSupportBlock />
      </div>
    </div>
  );
}
