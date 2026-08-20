import { forwardRef } from "react";
import { cn } from "@/lib/utils";
export const Textarea = forwardRef(({
  className,
  label,
  error,
  hint,
  id,
  wrapperClassName,
  ...props
}, ref) => {
  const textareaId = id ?? props.name;
  return <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
          </label>}
        <textarea ref={ref} id={textareaId} className={cn("focus-ring w-full rounded-lg border border-border-strong bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground", error && "border-danger", className)} aria-invalid={!!error} {...props} />
        {error && <p className="text-xs text-danger">{error}</p>}
        {!error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>;
});
Textarea.displayName = "Textarea";
