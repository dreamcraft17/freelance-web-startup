import { ReconciliationService } from "@/server/services/admin-finance.service";
import { AdminEmptyState, AdminPageIntro, AdminStatCard, AdminStatGrid } from "@/features/admin/components/AdminUi";
import {
  AdminTable,
  AdminTableScroll,
  AdminTbody,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr
} from "@/features/admin/components/tables/AdminTable";
import { requireAdminAccess } from "@/features/admin/lib/server-auth";

export default async function AdminReconciliationPage() {
  await requireAdminAccess("reconciliation");
  const service = new ReconciliationService();
  const summary = await service.getSummary(72);

  return (
    <div className="space-y-5">
      <AdminPageIntro
        title="Payment reconciliation"
        description="Read-only comparison of succeeded payment transactions vs webhook events (last 72 hours). Mismatches may indicate mock payments or webhook delivery gaps."
        badge="Read-only"
      />

      <AdminStatGrid>
        <AdminStatCard label="Transactions" value={String(summary.transactionCount)} />
        <AdminStatCard label="Webhooks" value={String(summary.webhookCount)} />
        <AdminStatCard label="Mismatches" value={String(summary.mismatchCount)} />
      </AdminStatGrid>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">Charges without webhook</h3>
        </div>
        {summary.chargesWithoutWebhook.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState title="No orphan charges" copy="Every recent charge has a matching webhook record." />
          </div>
        ) : (
          <AdminTableScroll className="p-3.5">
            <AdminTable>
              <AdminThead>
                <AdminTr variant="head">
                  <AdminTh>Provider txn</AdminTh>
                  <AdminTh>Contract</AdminTh>
                  <AdminTh>Amount</AdminTh>
                  <AdminTh>Created</AdminTh>
                </AdminTr>
              </AdminThead>
              <AdminTbody>
                {summary.chargesWithoutWebhook.map((t) => (
                  <AdminTr key={t.id}>
                    <AdminTd>
                      {t.provider} / {t.providerTxnId.slice(0, 16)}…
                    </AdminTd>
                    <AdminTd>{t.contractId?.slice(0, 12) ?? "—"}…</AdminTd>
                    <AdminTd>
                      {t.amount} {t.currency}
                    </AdminTd>
                    <AdminTd className="whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</AdminTd>
                  </AdminTr>
                ))}
              </AdminTbody>
            </AdminTable>
          </AdminTableScroll>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-3.5 py-2.5">
          <h3 className="text-sm font-semibold text-slate-900">Webhooks without transaction</h3>
        </div>
        {summary.webhooksWithoutTransaction.length === 0 ? (
          <div className="p-3.5">
            <AdminEmptyState title="No orphan webhooks" copy="Every recent webhook has a matching charge record." />
          </div>
        ) : (
          <AdminTableScroll className="p-3.5">
            <AdminTable>
              <AdminThead>
                <AdminTr variant="head">
                  <AdminTh>Provider</AdminTh>
                  <AdminTh>External id</AdminTh>
                  <AdminTh>Event</AdminTh>
                  <AdminTh>Processed</AdminTh>
                </AdminTr>
              </AdminThead>
              <AdminTbody>
                {summary.webhooksWithoutTransaction.map((w) => (
                  <AdminTr key={w.id}>
                    <AdminTd>{w.provider}</AdminTd>
                    <AdminTd>{w.externalId.slice(0, 20)}…</AdminTd>
                    <AdminTd>{w.eventType}</AdminTd>
                    <AdminTd className="whitespace-nowrap">{new Date(w.processedAt).toLocaleString()}</AdminTd>
                  </AdminTr>
                ))}
              </AdminTbody>
            </AdminTable>
          </AdminTableScroll>
        )}
      </section>
    </div>
  );
}
