import { cn } from "@/lib/utils";
export function Skeleton({
  className
}) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} />;
}
export function TableSkeleton({
  rows = 6,
  cols = 6
}) {
  return <div className="divide-y divide-border">
      {Array.from({
      length: rows
    }).map((_, r) => <div key={r} className="flex items-center gap-6 px-5 py-3.5">
          {Array.from({
        length: cols
      }).map((_, c) => <Skeleton key={c} className="h-4 flex-1" />)}
        </div>)}
    </div>;
}
export function CardSkeleton() {
  return <div className="rounded-xl border border-border bg-surface p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-3 h-3 w-32" />
    </div>;
}
