import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SettingsSectionCardProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headingId?: string;
};

export function SettingsSectionCard({
  icon: Icon,
  title,
  description,
  children,
  className,
  headingId
}: SettingsSectionCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-slate-200/80 shadow-sm ring-1 ring-slate-900/[0.02]",
        className
      )}
    >
      <CardHeader className="space-y-0 border-b border-slate-100/90 bg-gradient-to-b from-slate-50/90 to-white pb-4 pt-5">
        <div className="flex gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <Icon className="h-5 w-5 text-[#3525cd]" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 space-y-1 pt-0.5">
            <CardTitle
              id={headingId}
              className="text-base font-semibold leading-snug tracking-tight text-slate-900"
            >
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="text-sm leading-relaxed text-slate-600">{description}</CardDescription>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-5">{children}</CardContent>
    </Card>
  );
}
