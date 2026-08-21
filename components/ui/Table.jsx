import { cn } from "@/lib/utils";
export function TableContainer({
  children,
  className
}) {
  // Callers that also need a sticky <THead> must pass the vertical
  // max-height/overflow-y HERE, on this same element, not on a separate
  // wrapping div — per the CSS overflow spec, setting only overflow-x
  // implicitly computes overflow-y to "auto" too on whichever element
  // has it, so a second unbounded wrapper around this one becomes an
  // (unbounded, so invisible) scroll container of its own and steals the
  // sticky positioning context away from the one that actually scrolls.
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
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
