"use client";

import { useEffect, useState } from "react";
import { Sparkles, Users } from "lucide-react";
import { CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useCampaignLeads, useCampaignMatching } from "@/hooks/useCampaigns";
import { confirmCampaignMatching, runCampaignMatching } from "@/lib/api";
import { orNotAvailable } from "@/lib/utils";
export function MatchingStep({
  campaignId,
  onAdvanced
}) {
  const {
    data: leads
  } = useCampaignLeads(campaignId);
  const {
    data: matches,
    loading,
    refetch
  } = useCampaignMatching(campaignId);
  const {
    toast
  } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [ranOnce, setRanOnce] = useState(false);
  const confirmedLeads = (leads ?? []).filter(l => l.confirmed);
  useEffect(() => {
    if (loading || ranOnce) return;
    if (matches && matches.length === 0 && confirmedLeads.length > 0) {
      // Kick off the matching run once as soon as data confirms it hasn't happened yet.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRanOnce(true);
      setAnalyzing(true);
      runCampaignMatching(campaignId).then(() => refetch()).catch(err => toast({
        tone: "error",
        title: "Matching failed",
        description: err instanceof Error ? err.message : undefined
      })).finally(() => setAnalyzing(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, matches, confirmedLeads.length, ranOnce]);
  async function handleConfirm() {
    setConfirming(true);
    try {
      await confirmCampaignMatching(campaignId);
      onAdvanced();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to continue",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setConfirming(false);
    }
  }
  const grouped = confirmedLeads.map(lead => ({
    lead,
    results: (matches ?? []).filter(m => m.lead_id === lead.id)
  }));
  const busy = loading || analyzing;
  return <>
      <CardHeader title="Employee Matching" subtitle="Matching each lead's role against your bench of employees." />

      {busy && <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Sparkles className="h-6 w-6 animate-pulse text-brand" />
          <p className="text-sm font-medium text-foreground">Analyzing candidates...</p>
        </div>}

      {!busy && grouped.length === 0 && <EmptyState icon={<Users className="h-5 w-5" />} title="No confirmed leads" description="Go back and confirm at least one lead." />}

      {!busy && grouped.length > 0 && <div className="flex flex-col gap-6 px-5 py-4">
          {grouped.map(({
        lead,
        results
      }) => <div key={lead.id} className="rounded-xl border border-border">
              <div className="border-b border-border bg-gray-50/60 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{orNotAvailable(lead.company?.company_name)}</p>
                <p className="text-sm text-muted-foreground">{orNotAvailable(lead.job?.job_title)}</p>
              </div>
              {results.length === 0 ? <p className="px-4 py-4 text-sm text-muted-foreground">No matching employees found.</p> : <div className="divide-y divide-border">
                  {results.map(m => <div key={m.id} className="flex items-start justify-between gap-4 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {m.employee.name} · {m.employee.role_title}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{m.reasoning}</p>
                      </div>
                      <Badge tone={m.match_score >= 60 ? "success" : m.match_score >= 30 ? "warning" : "neutral"}>
                        {m.match_score}% match
                      </Badge>
                    </div>)}
                </div>}
            </div>)}
        </div>}

      <div className="flex items-center justify-end border-t border-border px-5 py-4">
        <Button onClick={handleConfirm} loading={confirming} disabled={busy || grouped.length === 0}>
          Confirm & Continue
        </Button>
      </div>
    </>;
}
