"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SETTINGS_NAV_ITEMS } from "@/lib/constants";

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings" className="flex gap-1 overflow-x-auto border-b border-border sm:w-48 sm:flex-col sm:border-b-0 sm:border-r sm:pr-4">
      {SETTINGS_NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-ring shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-gray-100 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
