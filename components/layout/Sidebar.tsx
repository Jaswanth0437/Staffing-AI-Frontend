"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  Contact as ContactIcon,
  LayoutDashboard,
  Megaphone,
  Settings,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Contact: ContactIcon,
  Megaphone,
};

export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "flex h-full flex-col bg-[var(--sidebar-bg)] transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-[var(--sidebar-border)] px-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
          L
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight text-white">
            {APP_NAME}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-[var(--sidebar-foreground)] hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 z-30 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-[var(--sidebar-border)] px-2 py-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-white/10 text-white"
              : "text-[var(--sidebar-foreground)] hover:bg-white/5 hover:text-white",
            collapsed && "justify-center px-0",
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-2 z-30 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Settings
            </span>
          )}
        </Link>

        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              "focus-ring mt-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sidebar-foreground)] hover:bg-white/5 hover:text-white md:flex",
              collapsed && "justify-center px-0",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            ) : (
              <>
                <PanelLeftClose className="h-[18px] w-[18px]" />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </nav>
  );
}
