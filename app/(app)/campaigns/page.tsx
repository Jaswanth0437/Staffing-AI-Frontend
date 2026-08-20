"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { CampaignsTable } from "@/components/campaigns/CampaignsTable";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useJobs } from "@/hooks/useJobs";
import { useLeads } from "@/hooks/useLeads";

export default function CampaignsPage() {
  const { data: campaigns, loading, error, refetch } = useCampaigns();
  const { data: jobs } = useJobs();
  const { data: leads } = useLeads();

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Campaigns are created automatically from the Search tab — each search that finds new jobs becomes a campaign."
      />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && (
        <Card>
          {loading && <TableSkeleton rows={4} cols={6} />}
          {!loading && <CampaignsTable campaigns={campaigns ?? []} jobs={jobs ?? []} leads={leads ?? []} />}
        </Card>
      )}
    </div>
  );
}
