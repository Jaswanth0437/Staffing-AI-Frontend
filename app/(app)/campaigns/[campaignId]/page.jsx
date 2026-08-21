"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { useCampaign, useCampaignJobs } from "@/hooks/useCampaigns";
import { recheckCampaign } from "@/lib/api";
import { formatApplicants, formatDateTime, orNotAvailable } from "@/lib/utils";

// search_criteria mixes free-text (job_role, location, company — already
// display-ready as the user typed them) with our internal snake_case tokens
// (employment_type, work_mode) — this only needs to fix up the latter.
function displayCriteriaValue(value) {
  if (!value) return undefined;
  return String(value).replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
}

const POLLING_STATUSES = new Set(["pending", "running"]);
const CRITERIA_FIELDS = [{
  key: "job_role",
  label: "Job Role"
}, {
  key: "location",
  label: "Location"
}, {
  key: "country",
  label: "Country"
}, {
  key: "experience_level",
  label: "Experience Level"
}, {
  key: "employment_type",
  label: "Employment Type"
}, {
  key: "work_mode",
  label: "Work Mode"
}, {
  key: "company",
  label: "Company"
}, {
  key: "posting_timeframe",
  label: "Posting Timeframe"
}];

export default function CampaignDetailsPage({
  params
}) {
  const {
    campaignId
  } = use(params);
  const {
    toast
  } = useToast();
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
  const [rechecking, setRechecking] = useState(false);
  const [confirmRecheck, setConfirmRecheck] = useState(false);

  const isRunning = campaign && POLLING_STATUSES.has(campaign.status);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setTimeout(() => {
      refetch({ silent: true });
      refetchJobs({ silent: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [isRunning, campaign, refetch, refetchJobs]);

  async function handleRecheck() {
    setRechecking(true);
    try {
      await recheckCampaign(campaignId);
      toast({
        tone: "success",
        title: "Recheck started",
        description: "Fetching the latest postings for this requirement — new jobs will be tagged and sorted to the top."
      });
      setConfirmRecheck(false);
      refetch();
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
  const criteria = campaign.search_criteria ?? {};
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Campaigns",
      href: "/campaigns"
    }, {
      label: campaign.name
    }]} title={<span className="flex flex-wrap items-center gap-3">
            {campaign.name}
            <CampaignStatusBadge status={campaign.status} />
          </span>} subtitle={`Role: ${campaign.role_name}`} actions={<div className="flex flex-col items-end gap-1">
            <Button variant="outline" title="Recheck campaign" icon={<RefreshCw className={rechecking ? "h-4 w-4 animate-spin" : "h-4 w-4"} />} loading={rechecking} disabled={isRunning} onClick={() => setConfirmRecheck(true)}>
              Recheck
            </Button>
            <span className="text-xs text-muted-foreground">
              Last checked: {campaign.last_checked_at ? formatDateTime(campaign.last_checked_at) : "Never"}
            </span>
          </div>} />

      <ConfirmDialog open={confirmRecheck} title="Recheck Campaign" description={'Fetch the latest postings for this requirement? Jobs already on file are kept as-is — only genuinely new postings are added and tagged "New".'} confirmLabel="Recheck" loading={rechecking} onConfirm={handleRecheck} onClose={() => setConfirmRecheck(false)} />

      {isRunning && <Card className="mb-6 flex items-center gap-3 px-5 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground">
            Discovering and qualifying jobs from Apify — this page updates automatically.
          </p>
        </Card>}

      <Card className="mb-6">
        <CardHeader title="Search Criteria" subtitle="What this campaign searches for — set at creation, not editable here." />
        <CardBody>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {CRITERIA_FIELDS.map(field => <div key={field.key}>
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{orNotAvailable(displayCriteriaValue(criteria[field.key]))}</dd>
              </div>)}
          </dl>
        </CardBody>
      </Card>

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
                      <Link href={`/campaigns/${campaignId}/jobs/${job.id}`} className="inline-flex items-center gap-2 font-medium text-foreground hover:text-brand">
                        {job.job_title}
                        {job.is_new && <Badge tone="brand">New</Badge>}
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
