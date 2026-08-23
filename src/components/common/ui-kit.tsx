import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  tone?: "default" | "accent" | "warning" | "success" | "info";
}) {
  const toneClass = {
    default: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    warning: "bg-warning text-warning-foreground",
    success: "bg-success text-success-foreground",
    info: "bg-info text-info-foreground",
  }[tone];

  return (
    <Card className="transition-shadow hover:shadow-[var(--shadow-lift)]">
      <CardContent className="flex items-start gap-4 p-5">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", toneClass)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
          {delta && <p className="mt-0.5 text-xs text-muted-foreground">{delta}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-success/12 text-success border-success/30",
    Paid: "bg-success/12 text-success border-success/30",
    "Expiring Soon": "bg-warning/15 text-warning border-warning/35",
    Partial: "bg-warning/15 text-warning border-warning/35",
    Pending: "bg-warning/15 text-warning border-warning/35",
    Expired: "bg-destructive/12 text-destructive border-destructive/30",
    Beginner: "bg-info/12 text-info border-info/30",
    Intermediate: "bg-warning/15 text-warning border-warning/35",
    Advanced: "bg-destructive/12 text-destructive border-destructive/30",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", map[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </Badge>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function MacroBar({
  label,
  value,
  target,
  unit,
  colorVar = "--color-accent",
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  colorVar?: string;
}) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {Math.round(value)} / {target} {unit}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%`, backgroundColor: `var(${colorVar})` }}
        />
      </div>
    </div>
  );
}

export function currency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}
