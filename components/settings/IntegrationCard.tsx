"use client";

import { useState } from "react";
import { KeyRound, Loader2, Settings2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { testIntegrationConnection } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import type { Integration } from "@/types/settings";

export function IntegrationCard({ integration }: { integration: Integration }) {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);

  async function handleTest() {
    setTesting(true);
    try {
      const result = await testIntegrationConnection(integration.id);
      toast({ tone: result.success ? "success" : "error", title: result.message });
    } catch (err) {
      toast({ tone: "error", title: "Connection test failed", description: err instanceof Error ? err.message : undefined });
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{integration.name}</p>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
          </div>
          <Badge tone={integration.status === "connected" ? "success" : "neutral"} dot>
            {integration.status === "connected" ? "Connected" : "Not Connected"}
          </Badge>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-gray-50 px-4 py-3">
          <p className="text-xs text-muted-foreground">{integration.name} API Key</p>
          <p className="mt-1 font-mono text-sm tracking-wider text-foreground">
            {integration.masked_key ?? "Not configured"}
          </p>
        </div>

        {integration.last_tested_at && (
          <p className="mt-3 text-xs text-muted-foreground">
            Last tested {formatDateTime(integration.last_tested_at)}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleTest} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Test Connection
          </Button>
          <Button variant="outline" size="sm" icon={<Settings2 className="h-4 w-4" />}>
            Configure
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
