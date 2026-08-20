import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
export const Select = forwardRef(({
  className,
  label,
  error,
  options,
  placeholder,
  id,
  ...props
}, ref) => {
  const selectId = id ?? props.name;
  return <div className="flex flex-col gap-1.5">
        {label && <label htmlFor={selectId} className="text-sm font-medium text-foreground">
            {label}
          </label>}
        <div className="relative">
          <select ref={ref} id={selectId} className={cn("focus-ring h-9 w-full appearance-none rounded-lg border border-border-strong bg-white px-3 pr-9 text-sm text-foreground", error && "border-danger", className)} aria-invalid={!!error} {...props}>
            {placeholder && <option value="" disabled>
                {placeholder}
              </option>}
            {options.map(option => <option key={option.value} value={option.value}>
                {option.label}
              </option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>;
});
Select.displayName = "Select";
