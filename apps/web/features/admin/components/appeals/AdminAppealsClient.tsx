"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type AppealRow = {
  id: string;
  appealReason: string;
  status: string;
  createdAt: string;
  suspension: {
    level: string;
    reason: string;
    user: { id: string; email: string };
  };
};

export function AdminAppealsClient({ initialAppeals }: { initialAppeals: AppealRow[] }) {
  const [appeals, setAppeals] = useState(initialAppeals);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(appealId: string, status: "APPROVED" | "DENIED") {
    setBusyId(appealId);
    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfJson = (await csrfRes.json()) as { data?: { token?: string } };
      const token = csrfJson.data?.token ?? "";
      const res = await fetch(`/api/moderation/appeals/${appealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAppeals((prev) => prev.map((a) => (a.id === appealId ? { ...a, status } : a)));
      }
    } finally {
      setBusyId(null);
    }
  }

  if (appeals.length === 0) {
    return <p className="nw-type-body text-slate-600">No appeals in queue.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200">
      {appeals.map((appeal) => (
        <li key={appeal.id} className="py-4 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="nw-type-body font-medium text-slate-900">{appeal.suspension.user.email}</p>
              <p className="nw-type-caption text-slate-500">
                {appeal.suspension.level} · {appeal.status}
              </p>
            </div>
            {appeal.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={busyId === appeal.id}
                  onClick={() => review(appeal.id, "APPROVED")}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === appeal.id}
                  onClick={() => review(appeal.id, "DENIED")}
                >
                  Deny
                </Button>
              </div>
            )}
          </div>
          <p className="nw-type-caption text-slate-600">{appeal.suspension.reason}</p>
          <p className="nw-type-body text-slate-800">{appeal.appealReason}</p>
        </li>
      ))}
    </ul>
  );
}
