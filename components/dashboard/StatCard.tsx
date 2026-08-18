import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change?: number;
  icon: ReactNode;
}) {
  const positive = (change ?? 0) >= 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-sm">
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium",
              positive ? "text-success" : "text-danger",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </Card>
  );
}
