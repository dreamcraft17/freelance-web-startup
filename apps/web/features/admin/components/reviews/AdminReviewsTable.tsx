import { ReviewTargetType } from "@acme/types";
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

export type AdminReviewRow = {
  id: string;
  authorLine: string;
  authorRole: string;
  targetLine: string;
  targetKind: ReviewTargetType;
  rating: number;
  createdAt: Date;
  commentPreview: string | null;
};

function RatingBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
      {value}/5
    </span>
  );
}

function TargetPill({ kind }: { kind: ReviewTargetType }) {
  const label = kind === ReviewTargetType.CLIENT ? "Client" : "Freelancer";
  const cls =
    kind === ReviewTargetType.CLIENT
      ? "bg-sky-50 text-sky-900 ring-sky-200"
      : "bg-violet-50 text-violet-900 ring-violet-200";
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ring-1 ${cls}`}>
      {label}
    </span>
  );
}

export function AdminReviewsTable({ rows }: { rows: AdminReviewRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>Review ID</AdminTh>
            <AdminTh>Author</AdminTh>
            <AdminTh>Target</AdminTh>
            <AdminTh className="text-center">Rating</AdminTh>
            <AdminTh>Created</AdminTh>
            <AdminTh>Comment</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {rows.map((r) => (
            <AdminTr key={r.id}>
              <AdminIdCell id={r.id} />
              <AdminTd className="max-w-[14rem]">
                <span className="font-medium text-slate-900" title={r.authorLine}>
                  {r.authorLine}
                </span>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">{r.authorRole}</p>
              </AdminTd>
              <AdminTd className="max-w-[16rem]">
                <div className="mb-1">
                  <TargetPill kind={r.targetKind} />
                </div>
                <p className="text-sm text-slate-800" title={r.targetLine}>
                  {r.targetLine}
                </p>
              </AdminTd>
              <AdminTd className="text-center">
                <RatingBadge value={r.rating} />
              </AdminTd>
              <AdminTd className="whitespace-nowrap text-xs text-slate-600">{formatAdminDateTime(r.createdAt)}</AdminTd>
              <AdminTd className="max-w-[20rem]">
                <p className="line-clamp-3 text-xs leading-relaxed text-slate-600" title={r.commentPreview ?? undefined}>
                  {r.commentPreview?.trim() ? r.commentPreview : <span className="text-slate-400">No comment</span>}
                </p>
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
