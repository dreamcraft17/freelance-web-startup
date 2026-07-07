"use client";

import { useState } from "react";
import { ModeratorQueueItem } from "@/components/design-system/ModeratorQueueItem";

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

function urgencyFromLevel(level: string): "low" | "medium" | "high" {
  const key = level.toUpperCase();
  if (key.includes("PERMANENT") || key.includes("BAN")) return "high";
  if (key.includes("TEMP") || key.includes("LIMIT")) return "medium";
  return "low";
}

function slaHoursRemaining(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const deadline = created + 7 * 24 * 60 * 60 * 1000;
  return (deadline - Date.now()) / (60 * 60 * 1000);
}

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
    return (
      <div className="nw-empty-state">
        <p className="font-medium text-slate-900">No appeals in queue</p>
        <p className="mt-2 text-sm text-slate-600">Suspension appeals from users will appear here for review.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {appeals.map((appeal) => (
        <ModeratorQueueItem
          key={appeal.id}
          id={appeal.id}
          category="Suspension appeal"
          urgency={urgencyFromLevel(appeal.suspension.level)}
          slaHoursRemaining={slaHoursRemaining(appeal.createdAt)}
          subject={appeal.suspension.user.email}
          summary={`${appeal.suspension.reason} — ${appeal.appealReason}`}
          status={appeal.status}
          busy={busyId === appeal.id}
          onApprove={appeal.status === "PENDING" ? () => review(appeal.id, "APPROVED") : undefined}
          onDeny={appeal.status === "PENDING" ? () => review(appeal.id, "DENIED") : undefined}
        />
      ))}
    </ul>
  );
}
