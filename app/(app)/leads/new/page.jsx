"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { LeadForm } from "@/components/leads/LeadForm";
import { useToast } from "@/components/ui/Toast";
import { createLead } from "@/lib/api";
export default function NewLeadPage() {
  const router = useRouter();
  const {
    toast
  } = useToast();
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      const lead = await createLead(values);
      toast({
        tone: "success",
        title: "Lead created",
        description: `${values.first_name} ${values.last_name} was added.`
      });
      router.push(`/leads/${lead.id}`);
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to create lead",
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
      label: "Add Lead"
    }]} title="Add Lead" subtitle="Manually add a new lead to your CRM." />
      <div className="max-w-3xl">
        <LeadForm submitLabel="Create Lead" submitting={submitting} onSubmit={handleSubmit} onCancel={() => router.push("/leads")} />
      </div>
    </div>;
}
