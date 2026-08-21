"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { useCampaign, useCampaignJobs } from "@/hooks/useCampaigns";
import { formatApplicants } from "@/lib/utils";

const POLLING_STATUSES = new Set(["pending", "running"]);

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

  const isRunning = campaign && POLLING_STATUSES.has(campaign.status);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setTimeout(() => {
      refetch({ silent: true });
      refetchJobs({ silent: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [isRunning, campaign, refetch, refetchJobs]);

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
          </span>} subtitle={`Role: ${campaign.role_name}`} />

      {isRunning && <Card className="mb-6 flex items-center gap-3 px-5 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground">
            Discovering and qualifying jobs from Apify — this page updates automatically.
          </p>
        </Card>}

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
        }, {
          label: "Pending",
          value: "pending"
        }]} />
        </div>

        {jobsLoading && <TableSkeleton rows={5} cols={5} />}

        {!jobsLoading && allJobs.length === 0 && <EmptyState icon={<Briefcase className="h-5 w-5" />} title={isRunning ? "Jobs will appear here as they're discovered" : "No jobs in this tab"} />}

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
                      {job.status === "pending" ? <span className="text-sm text-muted-foreground">Pending</span> : <QualificationBadge qualified={job.status === "qualified"} />}
                    </TD>
                    <TD>
                      {job.status !== "qualified" ? <span className="text-sm text-muted-foreground">—</span> : job.lead_id ? <Link href={`/campaigns/${campaignId}/leads/${job.lead_id}`}>
                            <Badge tone="success">Lead Created</Badge>
                          </Link> : <Badge tone="neutral">Not Created</Badge>}
                    </TD>
                  </TR>)}
              </TBody>
            </Table>
          </TableContainer>}
      </Card>
    </div>;
}
