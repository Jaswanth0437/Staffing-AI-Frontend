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
  return <table className={cn("w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm", className)} {...props} />;
}
export function THead({
  className,
  ...props
}) {
  // Sticky + a tinted, blurred backdrop by default — every scrollable table
  // in the app wants this, so it's the baseline instead of something each
  // page repeats (and can accidentally get out of sync).
  return <thead className={cn("sticky top-0 z-10 border-b border-border bg-gradient-to-r from-brand-soft/40 via-gray-50 to-gray-50 backdrop-blur-sm", className)} {...props} />;
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
  return <tr className={cn("group/row transition-all duration-150 hover:bg-brand-soft/25 hover:shadow-[inset_3px_0_0_0_var(--brand)]", className)} {...props} />;
}
export function TH({
  className,
  ...props
}) {
  return <th className={cn("px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", className)} {...props} />;
}
export function TD({
  className,
  ...props
}) {
  return <td className={cn("px-4 py-4 align-middle text-foreground", className)} {...props} />;
}
