import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepItem {
  label: string;
  value: number;
}

export function CampaignStepper({ steps, current }: { steps: StepItem[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-4">
      {steps.map((step, i) => {
        const done = step.value < current;
        const active = step.value === current;
        return (
          <li key={step.value} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                done && "bg-brand text-white",
                active && "border-2 border-brand text-brand",
                !done && !active && "border border-border-strong text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : step.value}
            </span>
            <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
              {step.label}
            </span>
            {i < steps.length - 1 && <span className="mx-2 hidden h-px w-8 bg-border sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}
