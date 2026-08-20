"use client";

import { cn } from "@/lib/utils";
export function Tabs({
  items,
  value,
  onChange
}) {
  return <div className="flex flex-wrap items-center gap-1.5">
      {items.map(item => {
      const active = item.value === value;
      return <button key={item.value} onClick={() => onChange(item.value)} className={cn("focus-ring flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", active ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-gray-100 hover:text-foreground")}>
            {item.label}
            {item.count !== undefined && <span className={cn("rounded-full px-1.5 py-0.5 text-xs", active ? "bg-white/70 text-brand" : "bg-gray-100 text-muted-foreground")}>
                {item.count}
              </span>}
          </button>;
    })}
    </div>;
}
