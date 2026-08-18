import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your application, integrations, and scraping defaults." />
      <div className="flex flex-col gap-6 sm:flex-row">
        <SettingsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
