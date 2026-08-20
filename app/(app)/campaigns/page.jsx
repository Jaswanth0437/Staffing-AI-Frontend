"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { CampaignsTable } from "@/components/campaigns/CampaignsTable";
import { useToast } from "@/components/ui/Toast";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useJobs } from "@/hooks/useJobs";
import { useLeads } from "@/hooks/useLeads";
import { recheckCampaign } from "@/lib/api";
export default function CampaignsPage() {
  const {
    data: campaigns,
    loading,
    error,
    refetch
  } = useCampaigns();
  const {
    data: jobs,
    refetch: refetchJobs
  } = useJobs();
  const {
    data: leads
  } = useLeads();
  const {
    toast
  } = useToast();
  const [recheckingId, setRecheckingId] = useState(null);

  async function handleRecheck(campaign) {
    setRecheckingId(campaign.id);
    try {
      const result = await recheckCampaign(campaign.id);
      if (result.newJobsFound) {
        toast({
          tone: "success",
          title: "New jobs found",
          description: `${result.jobs.length} new job(s) added to ${campaign.name}.`
        });
      } else {
        toast({
          tone: "info",
          title: "No new job available",
          description: `${campaign.name} has already been fully scraped for its current criteria.`
        });
      }
      refetchJobs();
    } catch (err) {
      toast({
        tone: "error",
        title: "Recheck failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setRecheckingId(null);
    }
  }
  return <div>
      <PageHeader title="Campaigns" subtitle="Create a campaign to pull jobs from Apify, then work each job through to a lead and an email." actions={<Link href="/campaigns/new" className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-hover">
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>} />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card>
          {loading && <TableSkeleton rows={4} cols={8} />}
          {!loading && <CampaignsTable campaigns={campaigns ?? []} jobs={jobs ?? []} leads={leads ?? []} onRecheck={handleRecheck} recheckingId={recheckingId} />}
        </Card>}
    </div>;
}
