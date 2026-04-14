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

export type AdminContractRow = {
  id: string;
  jobTitle: string;
  jobSlug: string;
  clientLabel: string;
  freelancerLabel: string;
  freelancerHandle?: string;
  status: string;
  amountLabel: string;
  createdAt: Date;
};

function StatusPill({ children }: { children: string }) {
  return (
    <span className="inline-flex max-w-full truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-800 ring-1 ring-slate-200/80">
      {children}
    </span>
  );
}

export function AdminContractsTable({ contracts }: { contracts: AdminContractRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>Contract ID</AdminTh>
            <AdminTh>Job</AdminTh>
            <AdminTh>Client</AdminTh>
            <AdminTh>Freelancer</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Amount</AdminTh>
            <AdminTh>Created</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {contracts.map((c) => (
            <AdminTr key={c.id}>
              <AdminIdCell id={c.id} />
              <AdminTd className="max-w-[18rem]">
                <span className="font-medium text-slate-900" title={c.jobTitle}>
                  {c.jobTitle}
                </span>
                <p className="mt-0.5 font-mono text-[10px] text-slate-400" title={c.jobSlug}>
                  {c.jobSlug}
                </p>
              </AdminTd>
              <AdminTd className="max-w-[12rem] text-slate-700" title={c.clientLabel}>
                {c.clientLabel}
              </AdminTd>
              <AdminTd className="max-w-[14rem]">
                <span className="text-slate-900">{c.freelancerLabel}</span>
                {c.freelancerHandle ? (
                  <p className="mt-0.5 font-mono text-[10px] text-slate-500">{c.freelancerHandle}</p>
                ) : null}
              </AdminTd>
              <AdminTd>
                <StatusPill>{c.status}</StatusPill>
              </AdminTd>
              <AdminTd className="text-right font-medium tabular-nums text-slate-900">{c.amountLabel}</AdminTd>
              <AdminTd className="whitespace-nowrap text-xs text-slate-600">{formatAdminDateTime(c.createdAt)}</AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
