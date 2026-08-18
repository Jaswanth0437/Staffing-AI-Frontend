"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  label: string;
  value: string;
  count?: number;
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              "focus-ring relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "text-brand" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  active ? "bg-brand-soft text-brand" : "bg-gray-100 text-muted-foreground",
                )}
              >
                {item.count}
              </span>
            )}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />}
          </button>
        );
      })}
    </div>
  );
}
