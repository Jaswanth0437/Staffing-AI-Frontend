"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronDown, Contact as ContactIcon, IdCard, LayoutDashboard, Mail, Megaphone, Search, Settings, Users, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
const ICONS = {
  LayoutDashboard,
  Search,
  Users,
  Building2,
  Contact: ContactIcon,
  Megaphone,
  IdCard,
  Mail
};
export function Sidebar({
  collapsed,
  onToggle,
  onNavigate
}) {
  const pathname = usePathname();
  return <nav aria-label="Primary" className={cn("flex h-full flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-[width] duration-200", collapsed ? "w-[68px]" : "w-64")}>
      <div className="flex h-14 items-center gap-2 border-b border-[var(--sidebar-border)] px-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
          L
        </div>
        {!collapsed && <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </span>}
        {onToggle && <button onClick={onToggle} className="focus-ring ml-auto hidden shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-gray-100 md:flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map(item => {
        const Icon = ICONS[item.icon];
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return <Link key={item.href} href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined} className={cn("focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-brand-soft text-brand" : "text-[var(--sidebar-foreground)] hover:bg-gray-100 hover:text-foreground", collapsed && "justify-center px-0")}>
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && <span className="pointer-events-none absolute left-full ml-2 z-30 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>}
            </Link>;
      })}
      </div>

      <div className="border-t border-[var(--sidebar-border)] px-2 py-3">
        <Link href="/settings" onClick={onNavigate} title={collapsed ? "Settings" : undefined} className={cn("focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", pathname.startsWith("/settings") ? "bg-brand-soft text-brand" : "text-[var(--sidebar-foreground)] hover:bg-gray-100 hover:text-foreground", collapsed && "justify-center px-0")}>
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
          {collapsed && <span className="pointer-events-none absolute left-full ml-2 z-30 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Settings
            </span>}
        </Link>

        <button className={cn("focus-ring mt-2 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-gray-100", collapsed && "justify-center px-0")}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
            {initials(APP_NAME)}
          </span>
          {!collapsed && <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">Alex Morgan</span>
                <span className="block truncate text-xs text-muted-foreground">{APP_NAME}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>}
        </button>
      </div>
    </nav>;
}
