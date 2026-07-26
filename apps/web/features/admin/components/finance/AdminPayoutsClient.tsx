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

type PayoutRow = {
  id: string;
  amountCents: number;
  feeCents: number;
  currency: string;
  status: string;
  requestedAt: string;
  user: { id: string; email: string };
};

export function AdminPayoutsClient({ initialPayouts }: { initialPayouts: PayoutRow[] }) {
  const [payouts, setPayouts] = useState(initialPayouts);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function approve(payoutId: string) {
    setBusyId(payoutId);
    try {
      const res = await fetchWithCsrf(`/api/admin/payouts/${payoutId}/approve`, { method: "POST" });
      if (res.ok) {
        setPayouts((prev) => prev.filter((p) => p.id !== payoutId));
      }
    } finally {
      setBusyId(null);
    }
  }

  if (payouts.length === 0) {
    return (
      <AdminEmptyState
        title="No pending payouts"
        copy="Freelancer payout requests awaiting approval will appear here."
      />
    );
  }

  return (
    <AdminTable>
      <AdminThead>
        <AdminTr>
          <AdminTh>Freelancer</AdminTh>
          <AdminTh>Amount</AdminTh>
          <AdminTh>Fee</AdminTh>
          <AdminTh>Requested</AdminTh>
          <AdminTh>Actions</AdminTh>
        </AdminTr>
      </AdminThead>
      <AdminTbody>
        {payouts.map((p) => (
          <AdminTr key={p.id}>
            <AdminTd>{p.user.email}</AdminTd>
            <AdminTd>
              {p.amountCents} {p.currency}
            </AdminTd>
            <AdminTd>{p.feeCents}</AdminTd>
            <AdminTd className="whitespace-nowrap text-slate-600">
              {new Date(p.requestedAt).toLocaleString()}
            </AdminTd>
            <AdminTd>
              <button
                type="button"
                disabled={busyId === p.id}
                onClick={() => approve(p.id)}
                className="rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Approve
              </button>
            </AdminTd>
          </AdminTr>
        ))}
      </AdminTbody>
    </AdminTable>
  );
}
