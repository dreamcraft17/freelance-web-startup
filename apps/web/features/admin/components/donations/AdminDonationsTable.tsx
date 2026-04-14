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

export type AdminDonationRow = {
  id: string;
  amountLabel: string;
  methodLabel: string;
  statusLabel: string;
  userLabel: string;
  createdAt: Date;
};

function Pill({ children, tone }: { children: string; tone: "slate" | "emerald" }) {
  const cls =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
      : "bg-slate-100 text-slate-800 ring-slate-200";
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 font-mono text-[11px] font-medium ring-1 ${cls}`}>
      {children}
    </span>
  );
}

export function AdminDonationsTable({ rows }: { rows: AdminDonationRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>Donation ID</AdminTh>
            <AdminTh className="text-right">Amount</AdminTh>
            <AdminTh>Method</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>User</AdminTh>
            <AdminTh>Created</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {rows.map((r) => (
            <AdminTr key={r.id}>
              <AdminIdCell id={r.id} />
              <AdminTd className="text-right font-semibold tabular-nums text-slate-900">{r.amountLabel}</AdminTd>
              <AdminTd>
                <Pill tone="slate">{r.methodLabel}</Pill>
              </AdminTd>
              <AdminTd>
                <Pill tone="emerald">{r.statusLabel}</Pill>
              </AdminTd>
              <AdminTd className="max-w-[16rem]">
                <span className="text-sm text-slate-800" title={r.userLabel}>
                  {r.userLabel}
                </span>
              </AdminTd>
              <AdminTd className="whitespace-nowrap text-xs text-slate-600">{formatAdminDateTime(r.createdAt)}</AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
