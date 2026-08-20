"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { CampaignsTable } from "@/components/campaigns/CampaignsTable";
import { useCampaigns } from "@/hooks/useCampaigns";
export default function CampaignsPage() {
  const {
    data: campaigns,
    loading,
    error,
    refetch
  } = useCampaigns();
  return <div>
      <PageHeader title="Campaigns" subtitle="Create a campaign to pull jobs from Apify, then work each job through to a lead and an email." actions={<Link href="/campaigns/new" className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-hover">
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>} />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card>
          {loading && <TableSkeleton rows={4} cols={5} />}
          {!loading && <CampaignsTable campaigns={campaigns ?? []} />}
        </Card>}
    </div>;
}
