import { formatAdminDateTime } from "@/features/admin/components/AdminUi";
import {
  AdminIdCell,
  AdminTable,
  AdminTableScroll,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
  AdminTbody
} from "@/features/admin/components/tables/AdminTable";

export type UserSubscriptionRow = {
  id: string;
  userEmail: string;
  planLabel: string;
  planCode: string;
  billingCycle: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  periodStart: Date;
  periodEnd: Date;
};

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
      : status === "TRIALING"
        ? "bg-sky-50 text-sky-900 ring-sky-200"
        : status === "PAST_DUE"
          ? "bg-amber-50 text-amber-900 ring-amber-200"
          : status === "CANCELED" || status === "EXPIRED"
            ? "bg-slate-100 text-slate-700 ring-slate-200"
            : "bg-slate-100 text-slate-800 ring-slate-200";

  return (
    <span
      className={`inline-flex max-w-full truncate rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ring-1 ${tone}`}
    >
      {status}
    </span>
  );
}

export function UserSubscriptionsTable({ rows }: { rows: UserSubscriptionRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>Subscription</AdminTh>
            <AdminTh>User</AdminTh>
            <AdminTh>Plan</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Period</AdminTh>
            <AdminTh>Created</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {rows.map((r) => (
            <AdminTr key={r.id}>
              <AdminIdCell id={r.id} />
              <AdminTd className="max-w-[14rem]">
                <span className="font-medium text-slate-900" title={r.userEmail}>
                  {r.userEmail}
                </span>
              </AdminTd>
              <AdminTd className="max-w-[16rem]">
                <span className="text-slate-900">{r.planLabel}</span>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                  {r.planCode} · {r.billingCycle}
                </p>
              </AdminTd>
              <AdminTd>
                <div className="flex flex-col gap-1">
                  <StatusPill status={r.status} />
                  {r.cancelAtPeriodEnd ? (
                    <span className="text-[10px] font-medium text-amber-800">Cancels at period end</span>
                  ) : null}
                </div>
              </AdminTd>
              <AdminTd className="max-w-[14rem] text-xs leading-snug text-slate-700">
                <p className="whitespace-nowrap">{formatAdminDateTime(r.periodStart)}</p>
                <p className="text-slate-400">to</p>
                <p className="whitespace-nowrap">{formatAdminDateTime(r.periodEnd)}</p>
              </AdminTd>
              <AdminTd className="whitespace-nowrap text-xs text-slate-600">{formatAdminDateTime(r.createdAt)}</AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
