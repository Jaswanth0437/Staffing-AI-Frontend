import { CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { ActivityEvent } from "@/types/lead";

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="flex flex-col gap-5">
      {events.map((event, i) => (
        <li key={event.id} className="relative flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            {i < events.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
          </div>
          <div className="pb-1">
            <p className="text-sm font-medium text-foreground">{event.label}</p>
            {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(event.timestamp)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
