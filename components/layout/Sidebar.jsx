"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronDown, IdCard, LayoutDashboard, Mail, Megaphone, Search, Users, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { useCurrentUser } from "@/hooks/useCurrentUser";
const ICONS = {
  LayoutDashboard,
  Search,
  Users,
  Building2,
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
  const currentUser = useCurrentUser();
  return <nav aria-label="Primary" style={{
    background: "linear-gradient(180deg, var(--sidebar-bg) 0%, var(--sidebar-bg-end) 100%)"
  }} className={cn("flex h-full flex-col border-r border-[var(--sidebar-border)] transition-[width] duration-200", collapsed ? "w-[68px]" : "w-64")}>
      <div className="flex h-14 items-center gap-2.5 border-b border-[var(--sidebar-border)] px-4">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft shadow-sm">
          <Image src="/Winlogo.png" alt={APP_NAME} width={20} height={20} className="object-contain" priority />
        </div>
        {!collapsed && <span className="truncate text-base font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </span>}
        {onToggle && <button onClick={onToggle} className="focus-ring ml-auto hidden shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-[var(--sidebar-hover)] hover:text-foreground md:flex" title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4">
        {NAV_ITEMS.map(item => {
        const Icon = ICONS[item.icon];
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return <Link key={item.href} href={item.href} onClick={onNavigate} title={collapsed ? item.label : undefined} className={cn("focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150", active ? "bg-brand-gradient text-white shadow-glow-brand" : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-hover)] hover:text-foreground", collapsed && "justify-center px-0")}>
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && <span className="pointer-events-none absolute left-full ml-2 z-30 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>}
            </Link>;
      })}
      </div>

      <div className="border-t border-[var(--sidebar-border)] px-2.5 py-3">
        <button title="Account" aria-label="Account" className={cn("focus-ring flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--sidebar-hover)]", collapsed && "justify-center px-0")}>
          <span className="bg-brand-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm">
            {initials(currentUser.name)}
          </span>
          {!collapsed && <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{currentUser.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{currentUser.email || APP_NAME}</span>
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>}
        </button>
      </div>
    </nav>;
}
