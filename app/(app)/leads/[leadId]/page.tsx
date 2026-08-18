"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { ActivityTimeline } from "@/components/leads/ActivityTimeline";
import { useLead } from "@/hooks/useLeads";
import { deleteLead, updateLeadStatus } from "@/lib/api";
import { LEAD_STATUS_OPTIONS } from "@/lib/constants";
import { formatApplicants, formatDate, orNotAvailable, titleCase } from "@/lib/utils";
import type { LeadStatus } from "@/types/lead";

function Field({ label, value, href }: { label: string; value?: string; href?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-brand hover:underline">
            {orNotAvailable(value)}
          </a>
        ) : (
          orNotAvailable(value)
        )}
      </dd>
    </div>
  );
}

export default function LeadDetailsPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = use(params);
  const { data: lead, loading, error, refetch } = useLead(leadId);
  const { toast } = useToast();
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<LeadStatus>("contacted");
  const [saving, setSaving] = useState(false);

  async function handleDelete() {
    if (!lead) return;
    setSaving(true);
    try {
      await deleteLead(lead.id);
      toast({ tone: "success", title: "Lead deleted" });
      router.push("/leads");
    } catch (err) {
      toast({ tone: "error", title: "Failed to delete lead", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
      setDeleteOpen(false);
    }
  }

  async function handleStatusChange() {
    if (!lead) return;
    setSaving(true);
    try {
      await updateLeadStatus(lead.id, newStatus);
      toast({ tone: "success", title: "Status updated" });
      refetch();
    } catch (err) {
      toast({ tone: "error", title: "Failed to update status", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
      setStatusOpen(false);
    }
  }

  if (error) return <ErrorState description={error} onRetry={refetch} />;

  if (loading || !lead) {
    return (
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-96" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  const activityEvents = [
    { id: "created", label: "Lead created", timestamp: lead.created_at },
    ...(lead.source === "Apollo"
      ? [{ id: "enriched", label: "Apollo enrichment completed", description: "Contact and company data enriched.", timestamp: lead.created_at }]
      : []),
    ...(lead.updated_at !== lead.created_at
      ? [{ id: "status", label: "Lead status changed", description: `Status set to ${titleCase(lead.status)}`, timestamp: lead.updated_at }]
      : []),
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Leads", href: "/leads" }, { label: lead.contact?.name ?? "Lead" }]}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {lead.contact?.name ?? "Unknown"}
            <LeadStatusBadge status={lead.status} />
          </span>
        }
        subtitle={`${orNotAvailable(lead.contact?.job_title)} · ${orNotAvailable(lead.company?.company_name)}`}
        actions={
          <>
            <Button variant="outline" icon={<RefreshCcw className="h-4 w-4" />} onClick={() => setStatusOpen(true)}>
              Change Status
            </Button>
            <Link
              href={`/leads/${lead.id}/edit`}
              className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-border-strong bg-white px-4 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Contact Information" />
            <CardBody>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <Field label="Name" value={lead.contact?.name} />
                <Field label="Job title" value={lead.contact?.job_title} />
                <Field label="Email" value={lead.contact?.email} href={lead.contact?.email ? `mailto:${lead.contact.email}` : undefined} />
                <Field label="Phone" value={lead.contact?.phone} />
                <Field label="LinkedIn" value={lead.contact?.linkedin_url} href={lead.contact?.linkedin_url} />
                <Field label="Contact type" value={lead.contact?.contact_type ? titleCase(lead.contact.contact_type) : undefined} />
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Company" />
            <CardBody>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <Field label="Company name" value={lead.company?.company_name} />
                <Field label="Website" value={lead.company?.company_website} href={lead.company?.company_website} />
                <Field label="LinkedIn" value={lead.company?.company_linkedin_url} href={lead.company?.company_linkedin_url} />
                <Field label="Domain" value={lead.company?.company_domain} />
                <Field label="Phone" value={lead.company?.company_phone} />
                <Field label="Employee size" value={lead.company?.employee_count ? `${lead.company.employee_count} employees` : undefined} />
              </dl>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Lead Information" />
            <CardBody>
              <dl className="flex flex-col gap-4">
                <Field label="Lead status" value={titleCase(lead.status)} />
                <Field label="Lead source" value={lead.source} />
                <Field label="Created date" value={formatDate(lead.created_at)} />
                <Field label="Last updated" value={formatDate(lead.updated_at)} />
              </dl>
            </CardBody>
          </Card>

          {lead.job && (
            <Card>
              <CardHeader title="Job Information" />
              <CardBody>
                <dl className="flex flex-col gap-4">
                  <Field label="Job title" value={lead.job.job_title} />
                  <Field label="Job URL" value={lead.job.linkedin_url} href={lead.job.linkedin_url} />
                  <Field label="Location" value={lead.job.job_location} />
                  <Field label="Applicants" value={`${formatApplicants(lead.job.job_num_applicants)} applicants`} />
                  <Field label="Posted date" value={lead.job.job_posted_time} />
                  <Field label="Qualification reason" value={lead.job.qualification_reason} />
                </dl>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Activity" />
            <CardBody>
              <ActivityTimeline events={activityEvents} />
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete lead"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete {lead.contact?.name ?? "this lead"}? This action cannot be undone.
        </p>
      </Modal>

      <Modal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Change lead status"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} loading={saving}>
              Update Status
            </Button>
          </>
        }
      >
        <Select
          label="New status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
          options={LEAD_STATUS_OPTIONS.map((v) => ({ label: titleCase(v), value: v }))}
        />
      </Modal>
    </div>
  );
}
