"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { JobQualificationChecks } from "@/components/jobs/JobQualificationChecks";
import { JobContactCard } from "@/components/jobs/JobContactCard";
import { useToast } from "@/components/ui/Toast";
import { useJob } from "@/hooks/useJobs";
import { createLead } from "@/lib/api";
import { formatApplicants, formatEmployeeCount, orNotAvailable } from "@/lib/utils";
import type { LeadFormValues } from "@/types/lead";

export default function JobDetailsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const { data: job, loading, error, refetch } = useJob(jobId);
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSaveLead() {
    if (!job) return;
    setSaving(true);
    try {
      const [firstName, ...rest] = (job.contact?.name ?? "").split(" ");
      const values: LeadFormValues = {
        first_name: firstName || "",
        last_name: rest.join(" "),
        job_title: job.contact?.job_title ?? "",
        email: job.contact?.email ?? "",
        phone: job.contact?.phone ?? "",
        linkedin_url: job.contact?.linkedin_url ?? "",
        company_name: job.company?.company_name ?? job.company_name,
        company_website: job.company?.company_website ?? "",
        company_linkedin_url: job.company?.company_linkedin_url ?? "",
        company_domain: job.company?.company_domain ?? "",
        employee_count: job.company_employee_count ? String(job.company_employee_count) : "",
        lead_type: job.contact?.contact_type ?? "company_only",
        source: "Apollo",
        status: "new",
        notes: `Sourced from job posting: ${job.job_title}`,
      };
      const lead = await createLead(values);
      toast({ tone: "success", title: "Lead saved", description: `${job.job_title} was added to your leads.` });
      router.push(`/leads/${lead.id}`);
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to save lead",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return <ErrorState description={error} onRetry={refetch} />;
  }

  if (loading || !job) {
    return (
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-96" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Campaign", href: `/campaigns/${job.campaign_id}` }, { label: job.job_title }]}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {job.job_title}
            <QualificationBadge qualified={job.qualified} />
          </span>
        }
        subtitle={`${job.company_name} · ${job.job_location ?? "—"}`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.back()} icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            {job.linkedin_url && (
              <a
                href={job.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-border-strong bg-white px-4 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                Open LinkedIn
              </a>
            )}
            <Button onClick={handleSaveLead} loading={saving} icon={<UserPlus className="h-4 w-4" />}>
              Save as Lead
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Job Information" />
            <CardBody>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <Field label="Job title" value={job.job_title} />
                <Field label="Company" value={job.company_name} />
                <Field label="Location" value={job.job_location} />
                <Field label="Job type" value={job.job_employment_type} />
                <Field label="Experience level" value={job.job_seniority_level} />
                <Field label="Remote type" value={job.job_remote_type} />
                <Field label="Posted time" value={job.job_posted_time} />
                <Field label="Applicants" value={`${formatApplicants(job.job_num_applicants)} applicants`} />
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Qualification" />
            <CardBody>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Qualified:</span>
                <span className={job.qualified ? "text-sm font-semibold text-success" : "text-sm font-semibold text-danger"}>
                  {job.qualified ? "YES" : "NO"}
                </span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{job.qualification_reason}</p>
              {job.qualification_checks && <JobQualificationChecks checks={job.qualification_checks} />}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Job Description" />
            <CardBody>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {job.job_description ?? job.job_summary ?? "No description available."}
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Contact" subtitle="Resolved by Apollo enrichment" />
            <CardBody>
              <JobContactCard job={job} />
              <Button className="mt-4 w-full" onClick={handleSaveLead} loading={saving} icon={<UserPlus className="h-4 w-4" />}>
                Save Lead
              </Button>
            </CardBody>
          </Card>

          {job.company && (
            <Card>
              <CardHeader title="Company" />
              <CardBody>
                <dl className="flex flex-col gap-3">
                  <Field label="Company size" value={formatEmployeeCount(job.company_employee_count)} />
                  <Field
                    label="Industry"
                    value={job.job_industries ?? job.company.industry}
                  />
                  <Field
                    label="Website"
                    value={orNotAvailable(job.company.company_website)}
                    href={job.company.company_website}
                  />
                  <Field
                    label="LinkedIn"
                    value={orNotAvailable(job.company.company_linkedin_url)}
                    href={job.company.company_linkedin_url}
                  />
                </dl>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, href }: { label: string; value?: string; href?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">
        {href ? (
          <Link href={href} target="_blank" className="text-brand hover:underline">
            {orNotAvailable(value)}
          </Link>
        ) : (
          orNotAvailable(value)
        )}
      </dd>
    </div>
  );
}
