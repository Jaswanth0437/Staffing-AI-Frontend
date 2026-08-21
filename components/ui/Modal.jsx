"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDelayedUnmount } from "@/hooks/useDelayedUnmount";
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md"
}) {
  const [shouldRender, closing] = useDelayedUnmount(open, 150);
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!shouldRender) return null;
  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl"
  }[size];
  return <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={cn("absolute inset-0 bg-black/40", closing ? "animate-fade-out" : "animate-fade-in")} onClick={onClose} aria-hidden="true" />
      <div className={cn("relative z-10 w-full rounded-2xl border border-border bg-surface shadow-2xl", closing ? "animate-scale-out" : "animate-scale-in", sizeClass)}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="modal-title" className="text-sm font-semibold text-foreground">
            {title}
          </h2>
          <button onClick={onClose} title="Close dialog" aria-label="Close dialog" className="focus-ring rounded-lg p-1 text-muted-foreground hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </div>}
      </div>
    </div>;
}
