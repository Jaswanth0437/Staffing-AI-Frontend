"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
export function Dropdown({
  trigger,
  items,
  align = "right"
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  return <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && <div role="menu" className={cn("animate-scale-in absolute z-20 mt-1.5 min-w-[10rem] origin-top rounded-lg border border-border bg-surface py-1 shadow-lg", align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left")}>
          {items.map(item => <button key={item.label} role="menuitem" onClick={() => {
        setOpen(false);
        item.onSelect();
      }} className={cn("focus-ring flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50", item.danger ? "text-danger" : "text-foreground")}>
              {item.icon}
              {item.label}
            </button>)}
        </div>}
    </div>;
}
