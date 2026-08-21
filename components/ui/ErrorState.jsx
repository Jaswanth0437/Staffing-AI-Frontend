import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry
}) {
  return <div className="animate-fade-in flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger shadow-sm ring-1 ring-black/5">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>}
      </div>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>}
    </div>;
}
