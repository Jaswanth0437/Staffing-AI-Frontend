"use client";

import { Menu } from "lucide-react";
export function Header({
  onMenuClick
}) {
  return <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6 md:hidden">
      <button onClick={onMenuClick} className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-gray-100 md:hidden" aria-label="Open navigation menu">
        <Menu className="h-5 w-5" />
      </button>
    </header>;
}
