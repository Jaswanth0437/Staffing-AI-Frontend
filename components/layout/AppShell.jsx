"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
export function AppShell({
  children
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  return <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {mobileOpen && <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full w-64">
            <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <button onClick={() => setMobileOpen(false)} title="Close navigation menu" aria-label="Close navigation menu" className="focus-ring absolute right-[-40px] top-4 rounded-lg bg-black/40 p-1.5 text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div key={pathname} className="animate-page-in h-full">{children}</div>
        </main>
      </div>
    </div>;
}
