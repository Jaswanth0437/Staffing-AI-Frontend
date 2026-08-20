"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Briefcase, RotateCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { useToast } from "@/components/ui/Toast";
import { useCampaign, useCampaignJobs, useCampaignLeads } from "@/hooks/useCampaigns";
import { recheckCampaign } from "@/lib/api";
import { formatApplicants } from "@/lib/utils";
export default function CampaignDetailsPage({
  params
}) {
  const {
    campaignId
  } = use(params);
  const {
    data: campaign,
    loading: campaignLoading,
    error,
    refetch
  } = useCampaign(campaignId);
  const [tab, setTab] = useState("all");
  const {
    data: jobs,
    loading: jobsLoading,
    refetch: refetchJobs
  } = useCampaignJobs(campaignId, tab === "all" ? undefined : tab);
  const {
    data: leads
  } = useCampaignLeads(campaignId);
  const {
    toast
  } = useToast();
  const [rechecking, setRechecking] = useState(false);

  async function handleRecheck() {
    setRechecking(true);
    try {
      const result = await recheckCampaign(campaignId);
      if (result.newJobsFound) {
        toast({
          tone: "success",
          title: "New jobs found",
          description: `${result.jobs.length} new job(s) added.`
        });
      } else {
        toast({
          tone: "info",
          title: "No new job available"
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
      setRechecking(false);
    }
  }
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (campaignLoading || !campaign) {
    return <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>;
  }
  const allJobs = jobs ?? [];
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Campaigns",
      href: "/campaigns"
    }, {
      label: campaign.name
    }]} title={<span className="flex flex-wrap items-center gap-3">
            {campaign.name}
            <CampaignStatusBadge status={campaign.status} />
          </span>} subtitle={`Role: ${campaign.role_name} · ${leads?.length ?? 0} lead(s)`} actions={<Button variant="outline" icon={<RotateCw className="h-4 w-4" />} loading={rechecking} onClick={handleRecheck}>
            Recheck
          </Button>} />

      <Card>
        <CardHeader title="Jobs" subtitle="Jobs pulled from Apify for this campaign. Open a job to see its AI qualification reason and create a lead." />
        <div className="border-b border-border px-5 py-3">
          <Tabs value={tab} onChange={setTab} items={[{
          label: "All",
          value: "all"
        }, {
          label: "Qualified",
          value: "qualified"
        }, {
          label: "Rejected",
          value: "rejected"
        }]} />
        </div>

        {jobsLoading && <TableSkeleton rows={5} cols={6} />}

        {!jobsLoading && allJobs.length === 0 && <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No jobs in this tab" />}

        {!jobsLoading && allJobs.length > 0 && <TableContainer>
            <Table>
              <THead>
                <TR>
                  <TH>Job Title</TH>
                  <TH>Company</TH>
                  <TH>Location</TH>
                  <TH>Applicants</TH>
                  <TH>Status</TH>
                  <TH>Lead</TH>
                </TR>
              </THead>
              <TBody>
                {allJobs.map(job => <TR key={job.id}>
                    <TD>
                      <Link href={`/campaigns/${campaignId}/jobs/${job.id}`} className="font-medium text-foreground hover:text-brand">
                        {job.job_title}
                      </Link>
                    </TD>
                    <TD className="text-muted-foreground">{job.company_name}</TD>
                    <TD className="text-muted-foreground">{job.job_location}</TD>
                    <TD className="text-muted-foreground">{formatApplicants(job.job_num_applicants)}</TD>
                    <TD>
                      <QualificationBadge qualified={job.status === "qualified" || job.qualified} />
                    </TD>
                    <TD className="text-muted-foreground">
                      {job.lead_id ? <Link href={`/campaigns/${campaignId}/leads/${job.lead_id}`} className="text-brand hover:underline">
                          View lead
                        </Link> : "—"}
                    </TD>
                  </TR>)}
              </TBody>
            </Table>
          </TableContainer>}
      </Card>
    </div>;
}
