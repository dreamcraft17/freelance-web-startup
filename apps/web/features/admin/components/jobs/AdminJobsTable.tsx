import { AdminJobModerationToggle } from "@/features/admin/components/jobs/AdminJobModerationToggle";
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

export type AdminJobRow = {
  id: string;
  title: string;
  slug: string;
  clientLabel: string;
  status: string;
  createdAt: Date;
  bidCount: number;
  moderationHiddenAt: Date | null;
};

function StatusPill({ children }: { children: string }) {
  return (
    <span className="nw-chip nw-chip-muted inline-flex max-w-full truncate font-mono normal-case tracking-normal text-slate-800">
      {children}
    </span>
  );
}

export function AdminJobsTable({ jobs }: { jobs: AdminJobRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>Job ID</AdminTh>
            <AdminTh>Title</AdminTh>
            <AdminTh>Client</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh className="text-right">Bids</AdminTh>
            <AdminTh>Public</AdminTh>
            <AdminTh>Created</AdminTh>
            <AdminTh>Actions</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {jobs.map((j) => (
            <AdminTr key={j.id}>
              <AdminIdCell id={j.id} />
              <AdminTd className="max-w-[20rem]">
                <span className="font-medium text-slate-900" title={j.title}>
                  {j.title}
                </span>
                <p className="mt-0.5 font-mono text-[10px] text-slate-400" title={j.slug}>
                  {j.slug}
                </p>
              </AdminTd>
              <AdminTd className="max-w-[12rem] text-slate-700" title={j.clientLabel}>
                {j.clientLabel}
              </AdminTd>
              <AdminTd>
                <StatusPill>{j.status}</StatusPill>
              </AdminTd>
              <AdminTd className="text-right tabular-nums text-slate-800">{j.bidCount}</AdminTd>
              <AdminTd>
                {j.moderationHiddenAt ? (
                  <span className="nw-chip inline-flex border-rose-200 bg-rose-50 normal-case tracking-normal text-rose-900">
                    Hidden
                  </span>
                ) : (
                  <span className="nw-chip nw-chip-success inline-flex normal-case tracking-normal">
                    Listed
                  </span>
                )}
              </AdminTd>
              <AdminTd className="whitespace-nowrap text-xs text-slate-600">{formatAdminDateTime(j.createdAt)}</AdminTd>
              <AdminTd className="align-top">
                <AdminJobModerationToggle jobId={j.id} moderationHiddenAt={j.moderationHiddenAt} />
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
