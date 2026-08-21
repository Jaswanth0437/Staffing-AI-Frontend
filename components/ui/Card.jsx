import { cn } from "@/lib/utils";
export function Card({
  className,
  children,
  ...props
}) {
  return <div className={cn("rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.05)]", className)} {...props}>
      {children}
    </div>;
}
export function CardHeader({
  title,
  subtitle,
  action,
  className
}) {
  // A subtle brand-tinted wash (not a flat gray, not a full color block) is
  // enough to read as "header" vs. the plain-white body below on every card
  // in the app — one consistent visual language rather than a one-off.
  return <div className={cn("flex items-start justify-between gap-4 rounded-t-2xl border-b border-border bg-gradient-to-r from-brand-soft/50 via-surface to-surface px-5 py-4", className)}>
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>;
}
export function CardBody({
  className,
  children
}) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
