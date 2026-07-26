"use client";

import { useState } from "react";
import { fetchWithCsrf } from "@/features/auth/lib/fetch-with-csrf";
import { AdminEmptyState } from "@/features/admin/components/AdminUi";
import {
  AdminTable,
  AdminTbody,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr
} from "@/features/admin/components/tables/AdminTable";

type DisputeRow = {
  id: string;
  reason: string;
  status: string;
  initiatedByUserId: string;
  createdAt: string;
  contract: {
    id: string;
    escrowAmountCents: number | null;
    escrowStatus: string;
    status: string;
    currency: string | null;
    bid: { job: { title: string } };
  };
};

export function AdminDisputesClient({ initialDisputes }: { initialDisputes: DisputeRow[] }) {
  const [disputes, setDisputes] = useState(initialDisputes);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function resolve(
    disputeId: string,
    decision: "FAVOR_CLIENT" | "FAVOR_FREELANCER" | "SPLIT"
  ) {
    setBusyId(disputeId);
    try {
      const res = await fetchWithCsrf(`/api/admin/disputes/${disputeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision })
      });
      if (res.ok) {
        setDisputes((prev) => prev.filter((d) => d.id !== disputeId));
      }
    } finally {
      setBusyId(null);
    }
  }

  if (disputes.length === 0) {
    return (
      <AdminEmptyState
        title="No open disputes"
        copy="Contract disputes awaiting staff resolution will appear here."
      />
    );
  }

  return (
    <AdminTable>
      <AdminThead>
        <AdminTr>
          <AdminTh>Contract / job</AdminTh>
          <AdminTh>Reason</AdminTh>
          <AdminTh>Escrow</AdminTh>
          <AdminTh>Opened</AdminTh>
          <AdminTh>Actions</AdminTh>
        </AdminTr>
      </AdminThead>
      <AdminTbody>
        {disputes.map((d) => (
          <AdminTr key={d.id}>
            <AdminTd>
              <div className="font-medium text-slate-900">{d.contract.bid.job.title}</div>
              <div className="text-xs text-slate-500">{d.contract.id.slice(0, 12)}…</div>
            </AdminTd>
            <AdminTd className="max-w-xs truncate text-slate-700">{d.reason}</AdminTd>
            <AdminTd>
              {d.contract.escrowAmountCents ?? "—"} {d.contract.currency ?? "IDR"}
              <div className="text-xs text-slate-500">{d.contract.escrowStatus}</div>
            </AdminTd>
            <AdminTd className="whitespace-nowrap text-slate-600">
              {new Date(d.createdAt).toLocaleString()}
            </AdminTd>
            <AdminTd>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["FAVOR_CLIENT", "Client"],
                    ["FAVOR_FREELANCER", "Freelancer"],
                    ["SPLIT", "Split"]
                  ] as const
                ).map(([decision, label]) => (
                  <button
                    key={decision}
                    type="button"
                    disabled={busyId === d.id}
                    onClick={() => resolve(d.id, decision)}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTbody>
    </AdminTable>
  );
}
