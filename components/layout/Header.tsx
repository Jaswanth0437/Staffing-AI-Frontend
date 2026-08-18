"use client";

import { useState } from "react";
import { Bell, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { initials } from "@/lib/utils";

const NOTIFICATIONS = [
  { id: "n1", title: "7 new qualified jobs", description: "From your last search run", time: "10m ago" },
  { id: "n2", title: "Apollo enrichment completed", description: "Daniel Reyes enriched successfully", time: "1h ago" },
  { id: "n3", title: "Lead status changed", description: "Priya Chandrasekaran moved to Qualified", time: "3h ago" },
];

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-gray-100 md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search leads, jobs, companies..."
          aria-label="Search"
          className="focus-ring h-9 w-full rounded-lg border border-border-strong bg-gray-50 pl-9 pr-3 text-sm placeholder:text-muted-foreground"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="focus-ring relative rounded-lg p-2 text-muted-foreground hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-border bg-surface shadow-lg">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="border-b border-border px-4 py-3 last:border-0 hover:bg-gray-50">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <Dropdown
          align="right"
          trigger={
            <button
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand"
              aria-label="Open user menu"
            >
              {initials("Alex Morgan")}
            </button>
          }
          items={[
            { label: "Profile", onSelect: () => {}, icon: <User className="h-4 w-4" /> },
            { label: "Settings", onSelect: () => {}, icon: <Settings className="h-4 w-4" /> },
            { label: "Sign out", onSelect: () => {}, icon: <LogOut className="h-4 w-4" />, danger: true },
          ]}
        />
      </div>
    </header>
  );
}
