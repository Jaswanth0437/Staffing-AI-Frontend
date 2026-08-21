"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
  width = "max-w-md"
}) {
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
  if (!open) return null;
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex">
      <div className="animate-fade-in absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className={cn("relative z-10 flex h-full w-full flex-col bg-surface shadow-xl", width, side === "right" ? "animate-panel-right ml-auto" : "animate-panel-left mr-auto")}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} title="Close panel" aria-label="Close panel" className="focus-ring rounded-lg p-1 text-muted-foreground hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
            {footer}
          </div>}
      </div>
    </div>;
}
