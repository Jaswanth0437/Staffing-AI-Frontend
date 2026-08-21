"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Building2, Mail as MailIcon, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { useCompany } from "@/hooks/useCompanies";
import { formatApplicants, formatDateTime, initials, orNotAvailable } from "@/lib/utils";
const EMAIL_STATUS_TONE = {
  draft: "neutral",
  sent: "success",
  failed: "danger"
};

// Every tab's table sits in a fixed-height scroll area so the card stays
// the same size regardless of how many rows a company has.
const TAB_PANEL_HEIGHT = "max-h-[22rem] overflow-y-auto";

function Field({
  label,
  value,
  href
}) {
  return <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">
        {href ? <a href={href} target="_blank" rel="noreferrer" className="text-brand hover:underline">
            {orNotAvailable(value)}
          </a> : orNotAvailable(value)}
      </dd>
    </div>;
}
export default function CompanyDetailsPage({
  params
}) {
  const {
    companyId
  } = use(params);
  const {
    data: company,
    loading,
    error,
    refetch
  } = useCompany(companyId);
  const [tab, setTab] = useState("overview");
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (loading || !company) {
    return <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>;
  }
  const contactsByLeadId = new Map(company.contacts.map(c => [c.lead_id, c]));
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Companies",
      href: "/companies"
    }, {
      label: company.company_name
    }]} title={<span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-sm font-semibold text-brand">
              {initials(company.company_name)}
            </span>
            {company.company_name}
          </span>} subtitle={orNotAvailable(company.location)} />

      <Card>
        <div className="border-b border-border px-5 py-3">
          <Tabs value={tab} onChange={setTab} items={[{
          label: "Overview",
          value: "overview"
        }, {
          label: "Contacts",
          value: "contacts",
          count: company.contacts.length
        }, {
          label: "Jobs",
          value: "jobs",
          count: company.jobs.length
        }, {
          label: "Leads",
          value: "leads",
          count: company.leads.length
        }, {
          label: "Emails",
          value: "emails",
          count: company.emails.length
        }]} />
        </div>

        {tab === "overview" && <CardBody>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <Field label="Company name" value={company.company_name} />
              <Field label="Location" value={company.location} />
              <Field label="Total jobs discovered" value={`${company.job_count}`} />
              <Field label="Qualified jobs" value={`${company.qualified_count}`} />
              <Field label="Leads created" value={`${company.lead_count}`} />
            </dl>
          </CardBody>}

        {tab === "contacts" && (company.contacts.length === 0 ? <EmptyState icon={<Users className="h-5 w-5" />} title="No contacts found" description="No contacts have been resolved for this company's leads yet." /> : <TableContainer className={TAB_PANEL_HEIGHT}>
                <Table>
                  <THead className="sticky top-0 z-10 bg-gray-50">
                    <TR>
                      <TH>Name</TH>
                      <TH>Title</TH>
                      <TH>Email</TH>
                      <TH>Phone</TH>
                      <TH>Source</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {company.contacts.map(c => <TR key={c.id}>
                        <TD className="font-medium text-foreground">{orNotAvailable(c.name)}</TD>
                        <TD className="text-muted-foreground">{orNotAvailable(c.designation)}</TD>
                        <TD className="text-muted-foreground">{orNotAvailable(c.email)}</TD>
                        <TD className="text-muted-foreground">{orNotAvailable(c.phone)}</TD>
                        <TD className="text-muted-foreground">{c.source}</TD>
                      </TR>)}
                  </TBody>
                </Table>
              </TableContainer>)}

        {tab === "jobs" && (company.jobs.length === 0 ? <EmptyState icon={<Building2 className="h-5 w-5" />} title="No jobs found" description="No jobs discovered for this company yet." /> : <TableContainer className={TAB_PANEL_HEIGHT}>
                <Table>
                  <THead className="sticky top-0 z-10 bg-gray-50">
                    <TR>
                      <TH>Job Title</TH>
                      <TH>Location</TH>
                      <TH>Applicants</TH>
                      <TH>Qualification</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {company.jobs.map(j => <TR key={j.id}>
                        <TD>
                          <Link href={`/campaigns/${j.campaign_id}/jobs/${j.id}`} className="font-medium text-foreground hover:text-brand">
                            {j.job_title}
                          </Link>
                        </TD>
                        <TD className="text-muted-foreground">{orNotAvailable(j.job_location)}</TD>
                        <TD className="text-muted-foreground">{formatApplicants(j.job_num_applicants)}</TD>
                        <TD>
                          {j.status === "pending" ? <span className="text-sm text-muted-foreground">Pending</span> : <QualificationBadge qualified={j.qualified} />}
                        </TD>
                      </TR>)}
                  </TBody>
                </Table>
              </TableContainer>)}

        {tab === "leads" && (company.leads.length === 0 ? <EmptyState icon={<Users className="h-5 w-5" />} title="No leads found" description="No leads have been created for this company yet." /> : <TableContainer className={TAB_PANEL_HEIGHT}>
                <Table>
                  <THead className="sticky top-0 z-10 bg-gray-50">
                    <TR>
                      <TH>Name</TH>
                      <TH>Email</TH>
                      <TH>Status</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {company.leads.map(l => {
                const contact = contactsByLeadId.get(l.id);
                return <TR key={l.id}>
                          <TD>
                            <Link href={`/campaigns/${l.campaign_id}/leads/${l.id}`} className="font-medium text-foreground hover:text-brand">
                              {contact?.name ?? "Unknown"}
                            </Link>
                          </TD>
                          <TD className="text-muted-foreground">{orNotAvailable(contact?.email)}</TD>
                          <TD>
                            <LeadStatusBadge status={l.status} />
                          </TD>
                        </TR>;
              })}
                  </TBody>
                </Table>
              </TableContainer>)}

        {tab === "emails" && (company.emails.length === 0 ? <EmptyState icon={<MailIcon className="h-5 w-5" />} title="No emails yet" description="Draft or send an email from one of this company's leads to see it here." /> : <TableContainer className={TAB_PANEL_HEIGHT}>
                <Table>
                  <THead className="sticky top-0 z-10 bg-gray-50">
                    <TR>
                      <TH>Recipient</TH>
                      <TH>Subject</TH>
                      <TH>Status</TH>
                      <TH>Sent</TH>
                      <TH className="text-right">Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {company.emails.map(e => <TR key={e.id}>
                        <TD className="font-medium text-foreground">{orNotAvailable(e.recipient)}</TD>
                        <TD className="text-muted-foreground">{orNotAvailable(e.subject)}</TD>
                        <TD>
                          <Badge tone={EMAIL_STATUS_TONE[e.status]} dot>
                            {e.status}
                          </Badge>
                        </TD>
                        <TD className="text-muted-foreground">{e.sent_at ? formatDateTime(e.sent_at) : "—"}</TD>
                        <TD className="text-right">
                          <Link href={`/campaigns/${e.campaign_id}/leads/${e.lead_id}`} className="focus-ring inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                            {e.status === "draft" ? "Edit / Send" : "View"}
                          </Link>
                        </TD>
                      </TR>)}
                  </TBody>
                </Table>
              </TableContainer>)}
      </Card>
    </div>;
}
