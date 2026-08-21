"use client";

import { use, useEffect, useRef, useState } from "react";
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
import { JOB_SOURCE_OPTIONS } from "@/lib/constants";
import { formatApplicants, formatDateTime, orNotAvailable, titleCase } from "@/lib/utils";

// search_criteria mixes free-text (job_role, location, company — already
// display-ready as the user typed them) with our internal snake_case tokens
// (employment_type, work_mode, job_source) — this only needs to fix up the
// latter. job_source is special-cased since "linkedin" needs its real
// mid-word capital, not the generic first-letter-only transform.
const JOB_SOURCE_LABELS = Object.fromEntries(JOB_SOURCE_OPTIONS.map(o => [o.value, o.label]));
function displayCriteriaValue(value, key) {
  if (!value) return undefined;
  if (key === "job_source") return JOB_SOURCE_LABELS[value] ?? value;
  return String(value).replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
}

// campaign.last_run_summary (set by the backend after every search/recheck)
// is what tells "Apify genuinely found nothing" apart from "Apify found
// plenty, the post-fetch filters just dropped all of it" — without it, both
// look identical: an empty jobs list with no explanation. See job_filters.py
// for where the reason categories below come from.
const FILTER_REASON_LABELS = {
  employment_type: "Employment Type",
  work_mode: "Work Mode",
  company: "Company"
};
function buildJobsEmptyDescription(summary) {
  if (!summary) return undefined;
  const { fetched = 0, reasons = {}, errors = {} } = summary;
  const errorSentences = Object.entries(errors).map(([source, message]) => `${JOB_SOURCE_LABELS[source] ?? titleCase(source)} search failed: ${message}`);
  if (fetched === 0) {
    return errorSentences.length ? errorSentences.join(" ") : "Apify found no postings matching this search.";
  }
  const reasonParts = Object.entries(reasons).filter(([, count]) => count > 0).map(([category, count]) => `${count} didn't match ${FILTER_REASON_LABELS[category] ?? category}`);
  const sentences = [`Apify found ${fetched} posting${fetched === 1 ? "" : "s"}, but all were filtered out before qualification${reasonParts.length ? " — " + reasonParts.join(", ") + "." : "."}`];
  return sentences.concat(errorSentences).join(" ");
}

const POLLING_STATUSES = new Set(["pending", "running"]);
const CRITERIA_FIELDS = [{
  key: "job_role",
  label: "Job Role"
}, {
  key: "location",
  label: "City"
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
}, {
  key: "job_source",
  label: "Job Source"
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
  // Always fetch the full unfiltered list — needed to show a count on every
  // tab, not just the active one — and filter to the active tab client-side.
  const {
    data: jobs,
    loading: jobsLoading,
    refetch: refetchJobs
  } = useCampaignJobs(campaignId);
  const [rechecking, setRechecking] = useState(false);
  const [confirmRecheck, setConfirmRecheck] = useState(false);

  const isRunning = campaign && POLLING_STATUSES.has(campaign.status);
  const wasRunning = useRef(false);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setTimeout(() => {
      refetch({ silent: true });
      refetchJobs({ silent: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [isRunning, campaign, refetch, refetchJobs]);

  // Polling above stops the instant `isRunning` goes false, but that alone
  // gives no feedback on what a completed run actually found — surface it
  // as a toast the moment a run we were watching finishes, rather than
  // leaving the user to guess from the (uncounted) tabs which changed.
  useEffect(() => {
    if (isRunning) {
      wasRunning.current = true;
      return;
    }
    if (!wasRunning.current || !campaign) return;
    wasRunning.current = false;
    if (campaign.status === "failed") {
      toast({
        tone: "error",
        title: "Recheck failed",
        description: "The job search failed — see Recent Activity for details."
      });
      return;
    }
    const newCount = (jobs ?? []).filter(j => j.is_new).length;
    let description = "No new postings since the last check.";
    if (newCount > 0) {
      description = `${newCount} new job${newCount === 1 ? "" : "s"} found and qualified.`;
    } else if (campaign.last_run_summary?.fetched > 0) {
      // Fetched something but nothing new landed — could be all-duplicates,
      // all-filtered, or both; buildJobsEmptyDescription's fuller breakdown
      // is already visible on the page itself once this toast fades.
      description = `Found ${campaign.last_run_summary.fetched} posting${campaign.last_run_summary.fetched === 1 ? "" : "s"}, but all were filtered out or already on file.`;
    }
    toast({
      tone: "success",
      title: "Recheck complete",
      description
    });
  }, [isRunning, campaign, jobs, toast]);

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
  const displayedJobs = tab === "all" ? allJobs : allJobs.filter(j => j.status === tab);
  const tabCounts = {
    all: allJobs.length,
    qualified: allJobs.filter(j => j.status === "qualified").length,
    rejected: allJobs.filter(j => j.status === "rejected").length,
    pending: allJobs.filter(j => j.status === "pending").length
  };
  const criteria = campaign.search_criteria ?? {};
  return <div className="flex h-full flex-col">
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

      {isRunning && <Card className="mb-6 shrink-0 flex items-center gap-3 px-5 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-brand" />
          <p className="text-sm text-muted-foreground">
            Discovering and qualifying jobs from Apify — this page updates automatically.
          </p>
        </Card>}

      <Card className="mb-6 shrink-0">
        <CardHeader title="Search Criteria" subtitle="What this campaign searches for — set at creation, not editable here." />
        <CardBody>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {CRITERIA_FIELDS.map(field => <div key={field.key}>
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">{orNotAvailable(displayCriteriaValue(criteria[field.key], field.key))}</dd>
              </div>)}
          </dl>
        </CardBody>
      </Card>

      <Card className="flex flex-1 min-h-[34rem] flex-col">
        <CardHeader title="Jobs" subtitle="Jobs pulled from Apify for this campaign. Open a job to see its AI qualification reason and create a lead." />
        <div className="shrink-0 border-b border-border px-5 py-3">
          <Tabs value={tab} onChange={setTab} items={[{
          label: "All",
          value: "all",
          count: tabCounts.all
        }, {
          label: "Qualified",
          value: "qualified",
          count: tabCounts.qualified
        }, {
          label: "Rejected",
          value: "rejected",
          count: tabCounts.rejected
        }, {
          label: "Pending",
          value: "pending",
          count: tabCounts.pending
        }]} />
        </div>

        <div className="flex flex-1 min-h-0 flex-col">
          {jobsLoading && <TableSkeleton rows={5} cols={5} />}

          {!jobsLoading && displayedJobs.length === 0 && <div className="flex flex-1 items-center justify-center"><EmptyState icon={<Briefcase className="h-5 w-5" />} title={isRunning ? "Jobs will appear here as they're discovered" : "No jobs in this tab"} description={!isRunning && tab === "all" ? buildJobsEmptyDescription(campaign.last_run_summary) : undefined} /></div>}

          {!jobsLoading && displayedJobs.length > 0 && <TableContainer className="flex-1 min-h-0 overflow-y-auto">
            <Table>
              <THead className="sticky top-0 z-10 bg-gray-50">
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
                {displayedJobs.map(job => <TR key={job.id}>
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
        </div>
      </Card>
    </div>;
}
