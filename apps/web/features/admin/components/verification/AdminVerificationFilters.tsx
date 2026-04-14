import { VerificationStatus } from "@acme/types";

const OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: VerificationStatus.PENDING, label: "Pending" },
  { value: VerificationStatus.VERIFIED, label: "Approved" },
  { value: VerificationStatus.REJECTED, label: "Rejected" },
  { value: VerificationStatus.NOT_VERIFIED, label: "Not verified" },
  { value: VerificationStatus.EXPIRED, label: "Expired" }
];

type Props = {
  status?: VerificationStatus;
};

export function AdminVerificationFilters({ status }: Props) {
  return (
    <form
      method="get"
      action="/admin/verification"
      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Queue status</span>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-sm focus:border-[#3525cd] focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
        >
          {OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-2 sm:pb-0.5">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Apply
        </button>
        <a
          href="/admin/verification"
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Reset
        </a>
      </div>
    </form>
  );
}
