import { Loader2 } from "lucide-react";

export default function AdminReportsLoading() {
  return (
    <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-600">
      <Loader2 className="h-6 w-6 animate-spin text-slate-500" aria-hidden />
      Loading moderation queue…
    </div>
  );
}
