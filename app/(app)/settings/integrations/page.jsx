"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { getIntegrations } from "@/lib/api";
import { IntegrationCard } from "@/components/settings/IntegrationCard";
export default function IntegrationsSettingsPage() {
  const [integrations, setIntegrations] = useState(undefined);
  useEffect(() => {
    getIntegrations().then(setIntegrations);
  }, []);
  if (!integrations) {
    return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>;
  }
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {integrations.map(integration => <IntegrationCard key={integration.id} integration={integration} />)}
    </div>;
}
