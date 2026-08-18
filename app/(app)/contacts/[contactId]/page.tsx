"use client";

import { use } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { ActivityTimeline } from "@/components/leads/ActivityTimeline";
import { useContact } from "@/hooks/useContacts";
import { formatEmployeeCount, initials, orNotAvailable, titleCase } from "@/lib/utils";

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

export default function ContactDetailsPage({ params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = use(params);
  const { data: contact, loading, error, refetch } = useContact(contactId);

  if (error) return <ErrorState description={error} onRetry={refetch} />;

  if (loading || !contact) {
    return (
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  const events = [
    { id: "created", label: "Contact discovered", timestamp: contact.created_at ?? "" },
    { id: "enriched", label: "Apollo enrichment completed", description: "Email and phone resolved via Apollo.", timestamp: contact.updated_at ?? contact.created_at ?? "" },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Contacts", href: "/contacts" }, { label: contact.name ?? "Contact" }]}
        title={
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
              {initials(contact.name)}
            </span>
            {contact.name}
          </span>
        }
        subtitle={`${orNotAvailable(contact.job_title)} · ${orNotAvailable(contact.company_name)}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Contact Information" />
            <CardBody>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <Field label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} />
                <Field label="Phone" value={contact.phone} />
                <Field label="LinkedIn" value={contact.linkedin_url} href={contact.linkedin_url} />
                <Field label="Contact type" value={contact.contact_type ? titleCase(contact.contact_type) : undefined} />
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Company Information" />
            <CardBody>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <Field label="Company" value={contact.company_name} />
                <Field label="Domain" value={contact.company_domain} />
                <Field label="Website" value={contact.company_domain ? `https://${contact.company_domain}` : undefined} />
                <Field label="Employee count" value={formatEmployeeCount(undefined)} />
              </dl>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Source" />
            <CardBody>
              <div className="flex items-center justify-between">
                <Badge tone="brand">{contact.source ?? "Apollo"}</Badge>
                <Badge tone={contact.enrichment_status === "enriched" ? "success" : "neutral"}>
                  {contact.enrichment_status ? titleCase(contact.enrichment_status) : "Enriched"}
                </Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <CardBody>
              <ActivityTimeline events={events} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
