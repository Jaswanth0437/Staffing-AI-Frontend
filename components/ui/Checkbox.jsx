import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
export const Checkbox = forwardRef(({
  className,
  label,
  id,
  ...props
}, ref) => {
  const checkboxId = id ?? props.name;
  return <label htmlFor={checkboxId} className="inline-flex select-none items-center gap-2 text-sm text-foreground">
        <span className="relative inline-flex h-4 w-4 items-center justify-center">
          <input ref={ref} id={checkboxId} type="checkbox" className={cn("peer focus-ring h-4 w-4 shrink-0 appearance-none rounded border border-border-strong bg-white checked:border-brand checked:bg-brand", className)} {...props} />
          <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
        </span>
        {label}
      </label>;
});
Checkbox.displayName = "Checkbox";
