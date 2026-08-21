import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
const TONE_STYLES = {
  brand: "from-brand-soft to-brand-soft/40 text-brand",
  info: "from-info-soft to-info-soft/40 text-info",
  violet: "from-violet-soft to-violet-soft/40 text-violet",
  warning: "from-warning-soft to-warning-soft/40 text-warning"
};
export function StatCard({
  label,
  value,
  change,
  icon,
  tone = "brand"
}) {
  const positive = (change ?? 0) >= 0;
  return <Card className="group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className={cn("pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-30", TONE_STYLES[tone])} />
      <div className="relative flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm", TONE_STYLES[tone])}>
          {icon}
        </div>
      </div>
      <p className="relative mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      {change !== undefined && <div className="relative mt-2 flex items-center gap-1 text-sm">
          <span className={cn("flex items-center gap-0.5 font-medium", positive ? "text-success" : "text-danger")}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">Vs Last Week</span>
        </div>}
    </Card>;
}
