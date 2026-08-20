import { forwardRef } from "react";
import { cn } from "@/lib/utils";
export const Input = forwardRef(({
  className,
  label,
  error,
  hint,
  icon,
  id,
  wrapperClassName,
  ...props
}, ref) => {
  const inputId = id ?? props.name;
  return <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>}
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>}
          <input ref={ref} id={inputId} className={cn("focus-ring h-9 w-full rounded-lg border border-border-strong bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground", icon && "pl-9", error && "border-danger", className)} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined} {...props} />
        </div>
        {error && <p id={`${inputId}-error`} className="text-xs text-danger">
            {error}
          </p>}
        {!error && hint && <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>}
      </div>;
});
Input.displayName = "Input";
