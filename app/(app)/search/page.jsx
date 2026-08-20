"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, RotateCw, Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { CampaignStageBadge } from "@/components/campaigns/CampaignStageBadge";
import { JobSearchForm } from "@/components/jobs/JobSearchForm";
import { useToast } from "@/components/ui/Toast";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useJobs } from "@/hooks/useJobs";
import { recheckSearch, searchJobs } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
export default function SearchPage() {
  const router = useRouter();
  const {
    toast
  } = useToast();
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
  const [searching, setSearching] = useState(false);
  const [rechecking, setRechecking] = useState(null);
  function jobsFor(campaignId) {
    return (jobs ?? []).filter(j => j.campaign_id === campaignId);
  }
  async function handleSearch(params) {
    setSearching(true);
    try {
      const result = await searchJobs(params);
      if (result.newJobsFound && result.campaign) {
        toast({
          tone: "success",
          title: "Campaign created",
          description: `${result.campaign.name} created with ${result.jobs.length} jobs found.`
        });
      } else {
        toast({
          tone: "info",
          title: "No new job available",
          description: "Try different search criteria."
        });
      }
      refetch();
      refetchJobs();
    } catch (err) {
      toast({
        tone: "error",
        title: "Search failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setSearching(false);
    }
  }
  async function handleRecheck(campaignId, params) {
    setRechecking(campaignId);
    try {
      const result = await recheckSearch(params);
      if (result.newJobsFound && result.campaign) {
        toast({
          tone: "success",
          title: "New campaign created",
          description: `${result.campaign.name} created with ${result.jobs.length} new jobs.`
        });
      } else {
        toast({
          tone: "info",
          title: "No new job available",
          description: "This requirement has already been fully scraped."
        });
      }
      refetch();
      refetchJobs();
    } catch (err) {
      toast({
        tone: "error",
        title: "Recheck failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setRechecking(null);
    }
  }
  return <div>
      <PageHeader title="Search" subtitle="Search LinkedIn job postings — every search that finds new jobs automatically creates a campaign." />

      <JobSearchForm onSearch={handleSearch} loading={searching} />

      <Card className="mt-6">
        <CardHeader title="Requirements searched" subtitle="Every search you've run and the campaign it created." />

        {error && <ErrorState description={error} onRetry={refetch} />}

        {!error && loading && <TableSkeleton rows={4} cols={7} />}

        {!error && !loading && (!campaigns || campaigns.length === 0) && <EmptyState icon={<SearchIcon className="h-5 w-5" />} title="No searches yet" description="Run a search above to discover jobs and create your first campaign." />}

        {!error && !loading && campaigns && campaigns.length > 0 && <TableContainer>
            <Table>
              <THead>
                <TR>
                  <TH>Campaign</TH>
                  <TH>Keyword</TH>
                  <TH>Location</TH>
                  <TH>Jobs Found</TH>
                  <TH>Qualified</TH>
                  <TH>Stage</TH>
                  <TH>Created</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {campaigns.map(campaign => {
              const campaignJobs = jobsFor(campaign.id);
              const qualified = campaignJobs.filter(j => j.qualified).length;
              return <TR key={campaign.id}>
                      <TD className="font-medium text-foreground">{campaign.name}</TD>
                      <TD className="text-muted-foreground">{campaign.search_filters.keyword}</TD>
                      <TD className="text-muted-foreground">{campaign.search_filters.location}</TD>
                      <TD className="text-muted-foreground">{campaignJobs.length}</TD>
                      <TD className="text-muted-foreground">{qualified}</TD>
                      <TD>
                        <CampaignStageBadge stage={campaign.stage} />
                      </TD>
                      <TD className="text-muted-foreground">{formatDateTime(campaign.created_at)}</TD>
                      <TD className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => router.push(`/campaigns/${campaign.id}`)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" icon={<RotateCw className="h-3.5 w-3.5" />} loading={rechecking === campaign.id} onClick={() => handleRecheck(campaign.id, campaign.search_filters)}>
                            Recheck
                          </Button>
                        </div>
                      </TD>
                    </TR>;
            })}
              </TBody>
            </Table>
          </TableContainer>}
      </Card>
    </div>;
}
