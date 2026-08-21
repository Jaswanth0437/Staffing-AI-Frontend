import { Activity } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime, titleCaseSentence } from "@/lib/utils";

// Color-codes each timeline dot by skimming the activity's own message —
// there's no dedicated "severity" field on ActivityLog, so this is a best
// effort read of the same human-readable text the feed already displays.
function dotColor(description = "") {
  const text = description.toLowerCase();
  if (text.includes("fail")) return "bg-danger";
  if (text.includes("rejected")) return "bg-danger";
  if (text.includes("sent") || text.includes("qualified") || text.includes("completed")) return "bg-success";
  if (text.includes("recheck") || text.includes("started") || text.includes("running")) return "bg-info";
  if (text.includes("matched")) return "bg-violet";
  return "bg-brand";
}
export function RecentActivityFeed({
  items,
  loading
}) {
  return <Card>
      <CardHeader title="Recent Activity" subtitle="Latest Updates Across Your Pipeline" />
      <div className="max-h-[22rem] overflow-y-auto px-5 py-2">
        {loading && Array.from({
        length: 4
      }).map((_, i) => <div key={i} className="flex items-start gap-3 py-3">
              <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            </div>)}
        {!loading && items && items.length === 0 && <EmptyState icon={<Activity className="h-5 w-5" />} title="No Recent Activity" description="Activity Will Appear Here As Leads Move Through Your Pipeline." />}
        {!loading && items?.map((item, i) => <div key={item.id} className="relative flex gap-3">
              <div className="flex flex-col items-center pt-1.5">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-surface ${dotColor(item.description)}`} />
                {i < items.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
              </div>
              <div className="min-w-0 pb-4">
                <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                <p className="truncate text-sm text-muted-foreground">{titleCaseSentence(item.description)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(item.timestamp)}
                </p>
              </div>
            </div>)}
      </div>
    </Card>;
}
