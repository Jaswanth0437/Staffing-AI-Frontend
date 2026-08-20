import { Activity } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime } from "@/lib/utils";
export function RecentActivityFeed({
  items,
  loading
}) {
  return <Card>
      <CardHeader title="Recent activity" subtitle="Latest updates across your pipeline" />
      <div className="divide-y divide-border">
        {loading && Array.from({
        length: 4
      }).map((_, i) => <div key={i} className="flex items-start gap-3 px-5 py-3.5">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            </div>)}
        {!loading && items && items.length === 0 && <EmptyState icon={<Activity className="h-5 w-5" />} title="No recent activity" description="Activity will appear here as leads move through your pipeline." />}
        {!loading && items?.map(item => <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Activity className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                <p className="truncate text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(item.timestamp)}
                </p>
              </div>
            </div>)}
      </div>
    </Card>;
}
