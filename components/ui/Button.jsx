import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
const variantStyles = {
  primary: "bg-brand-gradient text-brand-foreground border border-transparent shadow-sm hover:shadow-glow-brand hover:brightness-110",
  secondary: "bg-white text-foreground border border-border-strong hover:bg-gray-50 shadow-sm",
  outline: "bg-transparent text-foreground border border-border-strong hover:bg-gray-50",
  ghost: "bg-transparent text-foreground border border-transparent hover:bg-gray-100",
  danger: "bg-gradient-to-br from-red-500 to-danger text-white border border-transparent shadow-sm hover:brightness-110"
};
const sizeStyles = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
  icon: "h-9 w-9 p-0 justify-center"
};
export const Button = forwardRef(({
  className,
  variant = "primary",
  size = "md",
  loading,
  icon,
  disabled,
  children,
  ...props
}, ref) => {
  return <button ref={ref} disabled={disabled || loading} className={cn("focus-ring inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100", variantStyles[variant], sizeStyles[size], className)} {...props}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
      </button>;
});
Button.displayName = "Button";
