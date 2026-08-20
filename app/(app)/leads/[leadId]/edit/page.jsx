"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeadForm } from "@/components/leads/LeadForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { useLead } from "@/hooks/useLeads";
import { updateLead } from "@/lib/api";
export default function EditLeadPage({
  params
}) {
  const {
    leadId
  } = use(params);
  const {
    data: lead,
    loading,
    error,
    refetch
  } = useLead(leadId);
  const {
    toast
  } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (loading || !lead) {
    return <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-96 w-full" />
      </div>;
  }
  const [firstName, ...rest] = (lead.contact?.name ?? "").split(" ");
  const initialValues = {
    first_name: firstName ?? "",
    last_name: rest.join(" "),
    job_title: lead.contact?.job_title ?? "",
    email: lead.contact?.email ?? "",
    phone: lead.contact?.phone ?? "",
    linkedin_url: lead.contact?.linkedin_url ?? "",
    company_name: lead.company?.company_name ?? "",
    company_website: lead.company?.company_website ?? "",
    company_linkedin_url: lead.company?.company_linkedin_url ?? "",
    company_domain: lead.company?.company_domain ?? "",
    employee_count: lead.company?.employee_count ? String(lead.company.employee_count) : "",
    lead_type: lead.lead_type ?? "job_poster",
    source: lead.source,
    status: lead.status,
    notes: lead.notes ?? ""
  };
  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      await updateLead(leadId, values);
      toast({
        tone: "success",
        title: "Lead updated"
      });
      router.push(`/leads/${leadId}`);
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to update lead",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setSubmitting(false);
    }
  }
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Leads",
      href: "/leads"
    }, {
      label: lead.contact?.name ?? "Lead",
      href: `/leads/${leadId}`
    }, {
      label: "Edit"
    }]} title={`Edit ${lead.contact?.name ?? "Lead"}`} subtitle="Update this lead's contact, company, and status information." />
      <div className="max-w-3xl">
        <LeadForm initialValues={initialValues} submitLabel="Save Changes" submitting={submitting} onSubmit={handleSubmit} onCancel={() => router.push(`/leads/${leadId}`)} />
      </div>
    </div>;
}
