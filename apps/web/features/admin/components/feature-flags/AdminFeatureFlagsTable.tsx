import {
  AdminTable,
  AdminTableScroll,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
  AdminTbody
} from "@/features/admin/components/tables/AdminTable";
import type { MonetizationFlagDef } from "@/features/admin/lib/monetization-flag-defs";

export type ResolvedMonetizationFlagRow = MonetizationFlagDef & {
  value: boolean;
  envRaw: string | undefined;
};

function BoolPill({ value }: { value: boolean }) {
  return (
    <span
      className={
        value
          ? "inline-flex rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200"
          : "inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
      }
    >
      {value ? "true" : "false"}
    </span>
  );
}

export function AdminFeatureFlagsTable({ rows }: { rows: ResolvedMonetizationFlagRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>Environment key</AdminTh>
            <AdminTh>Config property</AdminTh>
            <AdminTh className="text-center">Resolved value</AdminTh>
            <AdminTh>Env override</AdminTh>
            <AdminTh>Description</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {rows.map((r) => (
            <AdminTr key={r.envKey}>
              <AdminTd className="max-w-[14rem]">
                <code className="break-all font-mono text-[11px] text-slate-900">{r.envKey}</code>
              </AdminTd>
              <AdminTd>
                <code className="font-mono text-[11px] text-slate-700">{r.property}</code>
              </AdminTd>
              <AdminTd className="text-center">
                <BoolPill value={r.value} />
              </AdminTd>
              <AdminTd className="max-w-[10rem] text-xs text-slate-600">
                {r.envRaw === undefined || r.envRaw === "" ? (
                  <span className="text-slate-400">(unset → default)</span>
                ) : (
                  <code className="break-all font-mono text-[11px] text-slate-800" title={r.envRaw}>
                    {r.envRaw}
                  </code>
                )}
              </AdminTd>
              <AdminTd className="max-w-[28rem] text-sm leading-snug text-slate-600">{r.description}</AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
