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

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  accountStatus: string;
  createdAt: Date;
};

function Pill({ children, tone }: { children: string; tone: "slate" | "indigo" }) {
  const cls =
    tone === "indigo"
      ? "bg-[#3525cd]/10 text-[#2d1fa8] ring-1 ring-[#3525cd]/15"
      : "bg-slate-100 text-slate-800 ring-1 ring-slate-200/80";
  return (
    <span className={`inline-flex max-w-full truncate rounded px-1.5 py-0.5 font-mono text-[11px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  return (
    <AdminTableScroll>
      <AdminTable>
        <AdminThead>
          <AdminTr variant="head">
            <AdminTh>User ID</AdminTh>
            <AdminTh>Email</AdminTh>
            <AdminTh>Role</AdminTh>
            <AdminTh>Account status</AdminTh>
            <AdminTh>Created</AdminTh>
          </AdminTr>
        </AdminThead>
        <AdminTbody>
          {users.map((u) => (
            <AdminTr key={u.id}>
              <AdminIdCell id={u.id} />
              <AdminTd className="max-w-[18rem]">
                <span className="font-medium text-slate-900" title={u.email}>
                  {u.email}
                </span>
              </AdminTd>
              <AdminTd>
                <Pill tone="indigo">{u.role}</Pill>
              </AdminTd>
              <AdminTd>
                <Pill tone="slate">{u.accountStatus}</Pill>
              </AdminTd>
              <AdminTd className="whitespace-nowrap text-xs text-slate-600">{formatAdminDateTime(u.createdAt)}</AdminTd>
            </AdminTr>
          ))}
        </AdminTbody>
      </AdminTable>
    </AdminTableScroll>
  );
}
