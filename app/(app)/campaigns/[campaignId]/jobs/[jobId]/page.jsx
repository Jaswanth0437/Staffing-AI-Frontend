"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { JobQualificationChecks } from "@/components/jobs/JobQualificationChecks";
import { useToast } from "@/components/ui/Toast";
import { useAsyncData } from "@/hooks/useAsyncData";
import { createLeadFromJob, getJob } from "@/lib/api";
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
  } = useAsyncData(() => getJob(jobId), [jobId]);
  const [creating, setCreating] = useState(false);
  async function handleCreateLead() {
    setCreating(true);
    try {
      const result = await createLeadFromJob(jobId);
      toast({
        tone: "success",
        title: "Lead created",
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
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (loading || !job) {
    return <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>;
  }
  const qualified = job.status === "qualified" || job.qualified;
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
            <QualificationBadge qualified={qualified} />
          </span>} subtitle={`${job.company_name} · ${job.job_location ?? "—"}`} actions={job.lead_id ? <Button variant="outline" onClick={() => router.push(`/campaigns/${campaignId}/leads/${job.lead_id}`)}>
            View Lead
          </Button> : <Button onClick={handleCreateLead} loading={creating} icon={<UserPlus className="h-4 w-4" />}>
            Create Lead
          </Button>} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Job Description" />
            <CardBody>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{job.job_description ?? job.job_summary}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="AI Qualification" />
            <CardBody>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Status:</span>
                <span className={qualified ? "text-sm font-semibold text-success" : "text-sm font-semibold text-danger"}>
                  {qualified ? "QUALIFIED" : "REJECTED"}
                </span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{job.reason ?? job.qualification_reason}</p>
              {job.qualification_checks && <JobQualificationChecks checks={job.qualification_checks} />}
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Company" />
            <CardBody>
              <dl className="flex flex-col gap-3">
                <Field label="Company" value={job.company_name} />
                <Field label="Employee count" value={job.company_employee_count ? `${job.company_employee_count}` : undefined} />
                <Field label="Applicants" value={job.job_num_applicants !== undefined ? `${job.job_num_applicants}` : undefined} />
                <Field label="Employment type" value={job.job_employment_type} />
                <Field label="Work mode" value={job.job_remote_type} />
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>;
}
function Field({
  label,
  value
}) {
  return <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value ?? "—"}</dd>
    </div>;
}
