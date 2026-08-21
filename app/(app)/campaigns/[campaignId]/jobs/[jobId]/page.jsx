"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDashed, ExternalLink, ThumbsDown, ThumbsUp, UserPlus, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobDescriptionText } from "@/components/jobs/JobDescriptionText";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { useToast } from "@/components/ui/Toast";
import { useAsyncData } from "@/hooks/useAsyncData";
import { createLeadFromJob, getCampaignJob, manualQualifyJob } from "@/lib/api";
import { JOB_SOURCE_OPTIONS } from "@/lib/constants";
import { formatDate, titleCase } from "@/lib/utils";

// "linkedin"/"dice" need their real brand capitalization ("LinkedIn"), not
// the generic first-letter-only titleCase transform.
const JOB_SOURCE_LABELS = Object.fromEntries(JOB_SOURCE_OPTIONS.map(o => [o.value, o.label]));

const RULE_FLAG_ICON = {
  passed: <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />,
  failed: <XCircle className="h-3.5 w-3.5 shrink-0 text-danger" />,
  skipped_no_data: <CircleDashed className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
};
export default function CampaignJobDetailsPage({
  params
}) {
  const {
    campaignId,
    jobId
  } = use(params);
  const router = useRouter();
  const {
    toast
  } = useToast();
  const {
    data: job,
    loading,
    error,
    refetch
  } = useAsyncData(() => getCampaignJob(campaignId, jobId), [campaignId, jobId]);
  const [creating, setCreating] = useState(false);
  const [overriding, setOverriding] = useState(null);

  async function handleOverride(status) {
    setOverriding(status);
    try {
      await manualQualifyJob(jobId, status, "Manually overridden");
      toast({
        tone: "success",
        title: `Marked ${status}`
      });
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to override qualification",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setOverriding(null);
    }
  }

  async function handleCreateLead() {
    setCreating(true);
    try {
      const result = await createLeadFromJob(jobId);
      toast({
        tone: "success",
        title: "Lead ready",
        description: `Contact resolved at the ${result.contact.type.replace("_", " ")} tier.`
      });
      router.push(`/campaigns/${campaignId}/leads/${result.lead_id}`);
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to create lead",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setCreating(false);
    }
  }
  function handleViewLead() {
    router.push(`/campaigns/${campaignId}/leads/${job.lead_id}`);
  }
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (loading || !job) {
    return <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>;
  }
  const pending = job.status === "pending";
  const qualified = job.status === "qualified";
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Campaigns",
      href: "/campaigns"
    }, {
      label: "Campaign",
      href: `/campaigns/${campaignId}`
    }, {
      label: job.job_title
    }]} title={<span className="flex flex-wrap items-center gap-3">
            {job.job_title}
            {pending ? <span className="text-sm font-medium text-muted-foreground">Pending</span> : <QualificationBadge qualified={qualified} />}
          </span>} subtitle={`${job.company_name} · ${job.job_location ?? "—"}`} actions={<>
            {job.url && <a href={job.url} target="_blank" rel="noreferrer" title="View original posting" className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-border-strong bg-white px-4 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                <ExternalLink className="h-4 w-4" />
                View Original Posting
              </a>}
            {!pending && qualified && (job.lead_id ? <Button title="View lead" onClick={handleViewLead} icon={<UserPlus className="h-4 w-4" />}>
                  View Lead
                </Button> : <Button title="Create lead" onClick={handleCreateLead} loading={creating} icon={<UserPlus className="h-4 w-4" />}>
                  Create Lead
                </Button>)}
          </>} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Job Description" />
            {/* Fixed height matching the Company card alongside it, with the
                (often much longer) description scrolling inside instead of
                pushing the page taller than its neighbor. */}
            <CardBody className="max-h-[22rem] overflow-y-auto">
              <JobDescriptionText text={job.job_description} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="AI Qualification" action={job.decided_by === "manual" && <Badge tone="brand">Manually overridden</Badge>} />
            <CardBody>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Status:</span>
                <span className={qualified ? "text-sm font-semibold text-success" : pending ? "text-sm font-semibold text-muted-foreground" : "text-sm font-semibold text-danger"}>
                  {job.status.toUpperCase()}
                </span>
              </div>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                {!pending && !qualified && <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />}
                <span>{job.reason || (pending ? "Still being qualified — check back shortly." : "No reason provided.")}</span>
              </p>

              {job.rule_flags && Object.keys(job.rule_flags).length > 0 && <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  {Object.entries(job.rule_flags).map(([key, value]) => <li key={key} className="flex items-center gap-2 text-sm">
                      {RULE_FLAG_ICON[value] ?? RULE_FLAG_ICON.skipped_no_data}
                      <span className="text-foreground">{titleCase(key)}</span>
                      <span className="text-muted-foreground">— {titleCase(value)}</span>
                    </li>)}
                </ul>}

              {!pending && <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">Disagree with this verdict?</span>
                  <Button size="sm" variant="outline" title="Mark qualified" icon={<ThumbsUp className="h-3.5 w-3.5" />} loading={overriding === "qualified"} disabled={qualified} onClick={() => handleOverride("qualified")}>
                    Mark Qualified
                  </Button>
                  <Button size="sm" variant="outline" title="Mark rejected" icon={<ThumbsDown className="h-3.5 w-3.5" />} loading={overriding === "rejected"} disabled={!qualified} onClick={() => handleOverride("rejected")}>
                    Mark Rejected
                  </Button>
                </div>}
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Company" />
            <CardBody>
              <dl className="flex flex-col gap-3">
                <Field label="Company" value={job.company_name} />
                <Field label="Applicants" value={job.job_num_applicants !== undefined && job.job_num_applicants !== null ? `${job.job_num_applicants}` : undefined} />
                <Field label="Source" value={JOB_SOURCE_LABELS[job.source] ?? titleCase(job.source ?? "")} />
                <Field label="Posted" value={job.posted_date ? formatDate(job.posted_date) : undefined} />
                <Field label="External job ID" value={job.external_job_id} />
                <Field label="Posting URL" value={job.url} href={job.url} />
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>;
}
function Field({
  label,
  value,
  href
}) {
  return <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
        {href && value ? <a href={href} target="_blank" rel="noreferrer" className="text-brand hover:underline">
            {value}
          </a> : value ?? "—"}
      </dd>
    </div>;
}
