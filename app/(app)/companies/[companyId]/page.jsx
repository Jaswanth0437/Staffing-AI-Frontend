"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { useCompany } from "@/hooks/useCompanies";
import { useJobs } from "@/hooks/useJobs";
import { useLeads } from "@/hooks/useLeads";
import { useContacts } from "@/hooks/useContacts";
import { formatApplicants, formatEmployeeCount, initials, orNotAvailable } from "@/lib/utils";
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
  const {
    data: jobs
  } = useJobs();
  const {
    data: leads
  } = useLeads();
  const {
    data: contacts
  } = useContacts();
  const [tab, setTab] = useState("overview");
  const relatedJobs = useMemo(() => (jobs ?? []).filter(j => j.company_id === companyId), [jobs, companyId]);
  const relatedContacts = useMemo(() => (contacts ?? []).filter(c => c.company_domain === company?.company_domain), [contacts, company]);
  const relatedLeads = useMemo(() => (leads ?? []).filter(l => l.company?.company_domain === company?.company_domain), [leads, company]);
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (loading || !company) {
    return <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>;
  }
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Companies",
      href: "/companies"
    }, {
      label: company.company_name ?? "Company"
    }]} title={<span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-sm font-semibold text-brand">
              {initials(company.company_name)}
            </span>
            {company.company_name}
          </span>} subtitle={`${orNotAvailable(company.industry)} · ${formatEmployeeCount(company.employee_count)}`} />

      <Card>
        <div className="border-b border-border px-5 py-3">
          <Tabs value={tab} onChange={setTab} items={[{
          label: "Overview",
          value: "overview"
        }, {
          label: "Contacts",
          value: "contacts",
          count: relatedContacts.length
        }, {
          label: "Jobs",
          value: "jobs",
          count: relatedJobs.length
        }, {
          label: "Leads",
          value: "leads",
          count: relatedLeads.length
        }]} />
        </div>

        {tab === "overview" && <CardBody>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <Field label="Company name" value={company.company_name} />
              <Field label="Industry" value={company.industry} />
              <Field label="Employee count" value={formatEmployeeCount(company.employee_count)} />
              <Field label="Location" value={company.location} />
              <Field label="Website" value={company.company_website} href={company.company_website} />
              <Field label="LinkedIn" value={company.company_linkedin_url} href={company.company_linkedin_url} />
              <Field label="Domain" value={company.company_domain} />
              <Field label="Phone" value={company.company_phone} />
            </dl>
          </CardBody>}

        {tab === "contacts" && (relatedContacts.length === 0 ? <EmptyState icon={<Users className="h-5 w-5" />} title="No contacts found" description="No enriched contacts are linked to this company yet." /> : <TableContainer>
              <Table>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH>Title</TH>
                    <TH>Email</TH>
                    <TH>Phone</TH>
                    <TH>Source</TH>
                  </TR>
                </THead>
                <TBody>
                  {relatedContacts.map(c => <TR key={c.id}>
                      <TD>
                        <Link href={`/contacts/${c.id}`} className="font-medium text-foreground hover:text-brand">
                          {c.name}
                        </Link>
                      </TD>
                      <TD className="text-muted-foreground">{orNotAvailable(c.job_title)}</TD>
                      <TD className="text-muted-foreground">{orNotAvailable(c.email)}</TD>
                      <TD className="text-muted-foreground">{orNotAvailable(c.phone)}</TD>
                      <TD className="text-muted-foreground">{c.source}</TD>
                    </TR>)}
                </TBody>
              </Table>
            </TableContainer>)}

        {tab === "jobs" && (relatedJobs.length === 0 ? <EmptyState icon={<Building2 className="h-5 w-5" />} title="No jobs found" description="No jobs discovered for this company yet." /> : <TableContainer>
              <Table>
                <THead>
                  <TR>
                    <TH>Job Title</TH>
                    <TH>Location</TH>
                    <TH>Applicants</TH>
                    <TH>Qualification</TH>
                  </TR>
                </THead>
                <TBody>
                  {relatedJobs.map(j => <TR key={j.id}>
                      <TD>
                        <Link href={`/jobs/${j.id}`} className="font-medium text-foreground hover:text-brand">
                          {j.job_title}
                        </Link>
                      </TD>
                      <TD className="text-muted-foreground">{j.job_location}</TD>
                      <TD className="text-muted-foreground">{formatApplicants(j.job_num_applicants)}</TD>
                      <TD>
                        <QualificationBadge qualified={j.qualified} />
                      </TD>
                    </TR>)}
                </TBody>
              </Table>
            </TableContainer>)}

        {tab === "leads" && (relatedLeads.length === 0 ? <EmptyState icon={<Users className="h-5 w-5" />} title="No leads found" description="No leads have been created for this company yet." /> : <TableContainer>
              <Table>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH>Email</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {relatedLeads.map(l => <TR key={l.id}>
                      <TD>
                        <Link href={`/leads/${l.id}`} className="font-medium text-foreground hover:text-brand">
                          {l.contact?.name ?? "Unknown"}
                        </Link>
                      </TD>
                      <TD className="text-muted-foreground">{orNotAvailable(l.contact?.email)}</TD>
                      <TD>
                        <LeadStatusBadge status={l.status} />
                      </TD>
                    </TR>)}
                </TBody>
              </Table>
            </TableContainer>)}
      </Card>
    </div>;
}
