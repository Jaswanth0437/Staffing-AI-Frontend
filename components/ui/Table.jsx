import { cn } from "@/lib/utils";
export function TableContainer({
  children
}) {
  return <div className="overflow-x-auto">{children}</div>;
}
export function Table({
  className,
  ...props
}) {
  return <table className={cn("w-full min-w-[720px] text-left text-sm", className)} {...props} />;
}
export function THead({
  className,
  ...props
}) {
  return <thead className={cn("border-b border-border bg-gray-50/60", className)} {...props} />;
}
export function TBody({
  className,
  ...props
}) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}
export function TR({
  className,
  ...props
}) {
  return <tr className={cn("transition-colors hover:bg-gray-50/80", className)} {...props} />;
}
export function TH({
  className,
  ...props
}) {
  return <th className={cn("px-4 py-3 text-xs font-medium text-muted-foreground", className)} {...props} />;
}
export function TD({
  className,
  ...props
}) {
  return <td className={cn("px-4 py-3.5 align-middle text-foreground", className)} {...props} />;
}
