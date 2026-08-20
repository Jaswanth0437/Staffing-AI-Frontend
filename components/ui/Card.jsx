import { cn } from "@/lib/utils";
export function Card({
  className,
  children,
  ...props
}) {
  return <div className={cn("rounded-xl border border-border bg-surface shadow-sm", className)} {...props}>
      {children}
    </div>;
}
export function CardHeader({
  title,
  subtitle,
  action,
  className
}) {
  return <div className={cn("flex items-start justify-between gap-4 border-b border-border px-5 py-4", className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
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
