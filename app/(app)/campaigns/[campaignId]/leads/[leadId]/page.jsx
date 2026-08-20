"use client";

import { use, useEffect, useState } from "react";
import { Send, Sparkles, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useAsyncData } from "@/hooks/useAsyncData";
import { confirmEmployeeForLead, generateEmailForLead, getLead, getLeadEmail, getLeadMatches, matchEmployeesForLead, sendLeadEmail, updateLeadEmail } from "@/lib/api";
import { CONTACT_TIER_LABELS } from "@/lib/constants";
import { orNotAvailable } from "@/lib/utils";
const TIER_TONE = {
  job_poster: "success",
  hr_contact: "info",
  company_level: "neutral"
};
export default function LeadDetailsPage({
  params
}) {
  const {
    campaignId,
    leadId
  } = use(params);
  const {
    toast
  } = useToast();
  const {
    data: lead,
    loading: leadLoading,
    error,
    refetch: refetchLead
  } = useAsyncData(() => getLead(leadId), [leadId]);
  const {
    data: matches,
    loading: matchesLoading,
    refetch: refetchMatches
  } = useAsyncData(() => getLeadMatches(leadId), [leadId]);
  const {
    data: email,
    refetch: refetchEmail
  } = useAsyncData(() => getLeadEmail(leadId), [leadId]);
  const [matching, setMatching] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    // Seeds the editable draft from the fetched email; local edits then
    // diverge from it until the next fetch (regenerate/send) replaces it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (email) setDraft(email);
  }, [email]);
  async function handleMatch() {
    setMatching(true);
    try {
      await matchEmployeesForLead(leadId);
      refetchMatches();
    } catch (err) {
      toast({
        tone: "error",
        title: "Matching failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setMatching(false);
    }
  }
  async function handleConfirm(employeeId) {
    setConfirmingId(employeeId);
    try {
      await confirmEmployeeForLead(leadId, employeeId);
      refetchMatches();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to confirm employee",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setConfirmingId(null);
    }
  }
  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generateEmailForLead(leadId);
      setDraft(prev => ({
        ...prev,
        ...result
      }));
      refetchEmail();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to generate email",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setGenerating(false);
    }
  }
  async function handleSend() {
    setSending(true);
    try {
      if (draft) {
        await updateLeadEmail(leadId, {
          from_email: draft.from_email,
          to_email: draft.to_email,
          subject: draft.subject,
          body: draft.body
        });
      }
      await sendLeadEmail(leadId);
      toast({
        tone: "success",
        title: "Email sent"
      });
      refetchEmail();
      refetchLead();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to send email",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setSending(false);
    }
  }
  if (error) return <ErrorState description={error} onRetry={refetchLead} />;
  if (leadLoading || !lead) {
    return <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>;
  }
  const contact = lead.contact ?? {};
  const sent = draft?.status === "sent" || email?.status === "sent";
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Campaigns",
      href: "/campaigns"
    }, {
      label: "Campaign",
      href: `/campaigns/${campaignId}`
    }, {
      label: "Lead"
    }]} title={contact.name ?? lead.company?.company_name ?? "Lead"} subtitle={lead.job?.job_title} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title="Employee Match" subtitle="Internal review only — never shown to the recipient." action={<Button variant="outline" size="sm" icon={<Sparkles className="h-3.5 w-3.5" />} loading={matching} onClick={handleMatch}>
                  {matches && matches.length > 0 ? "Re-match" : "Find Matching Employees"}
                </Button>} />
            {matchesLoading && <CardBody>
                <Skeleton className="h-24 w-full" />
              </CardBody>}
            {!matchesLoading && (!matches || matches.length === 0) && <EmptyState icon={<Users className="h-5 w-5" />} title="No matches yet" description="Run matching to rank employees against this job's requirements." />}
            {!matchesLoading && matches && matches.length > 0 && <div className="divide-y divide-border">
                {matches.map(m => <div key={m.id} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {m.employee.name} · {m.employee.role_title}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{m.reasoning}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge tone={m.match_score >= 0.6 ? "success" : m.match_score >= 0.3 ? "warning" : "neutral"}>
                        {Math.round(m.match_score * 100)}% match
                      </Badge>
                      <Button size="sm" variant={m.confirmed ? "secondary" : "outline"} icon={<UserCheck className="h-3.5 w-3.5" />} loading={confirmingId === m.employee_id} onClick={() => handleConfirm(m.employee_id)}>
                        {m.confirmed ? "Confirmed" : "Confirm"}
                      </Button>
                    </div>
                  </div>)}
              </div>}
          </Card>

          <Card>
            <CardHeader title="Email Review" subtitle="Editable before sending — no employee name or PII is referenced in the copy." action={<Button variant="outline" size="sm" icon={<Sparkles className="h-3.5 w-3.5" />} loading={generating} onClick={handleGenerate} disabled={!matches || matches.length === 0}>
                  {draft ? "Regenerate" : "Generate Email"}
                </Button>} />
            {!draft && <CardBody>
                <p className="text-sm text-muted-foreground">Generate an email once you&apos;ve matched employees for this lead.</p>
              </CardBody>}
            {draft && <CardBody className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input label="From" value={draft.from_email ?? ""} disabled={sent} onChange={e => setDraft(prev => ({
                ...prev,
                from_email: e.target.value
              }))} />
                  <Input label="To" value={draft.to_email ?? ""} disabled={sent} onChange={e => setDraft(prev => ({
                ...prev,
                to_email: e.target.value
              }))} />
                </div>
                <Input label="Subject" value={draft.subject ?? ""} disabled={sent} onChange={e => setDraft(prev => ({
              ...prev,
              subject: e.target.value
            }))} />
                <Textarea label="Body" rows={7} value={draft.body ?? ""} disabled={sent} onChange={e => setDraft(prev => ({
              ...prev,
              body: e.target.value
            }))} />
                {sent ? <Badge tone="success" className="self-start">Sent</Badge> : <Button className="self-end" icon={<Send className="h-4 w-4" />} loading={sending} onClick={handleSend}>
                    Send
                  </Button>}
              </CardBody>}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Resolved Contact" action={<Badge tone={TIER_TONE[contact.type] ?? "neutral"}>{CONTACT_TIER_LABELS[contact.type] ?? "Unknown"}</Badge>} />
            <CardBody>
              <dl className="flex flex-col gap-3">
                <Field label="Name" value={contact.name} />
                <Field label="Designation" value={contact.designation} />
                <Field label="Email" value={contact.email} />
                <Field label="Phone" value={contact.phone} />
                <Field label="LinkedIn" value={contact.linkedin_url} href={contact.linkedin_url} />
              </dl>
              {contact.type === "company_level" && <p className="mt-3 text-xs text-muted-foreground">
                  No individual contact resolved for this job — falling back to company-level data, as designed.
                </p>}
            </CardBody>
          </Card>

          {lead.company && <Card>
              <CardHeader title="Company" />
              <CardBody>
                <dl className="flex flex-col gap-3">
                  <Field label="Company" value={lead.company.company_name} />
                  <Field label="Domain" value={lead.company.company_domain} />
                  <Field label="Employee count" value={lead.company.employee_count ? `${lead.company.employee_count}` : undefined} />
                </dl>
              </CardBody>
            </Card>}
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
      <dd className="mt-0.5 text-sm font-medium text-foreground">
        {href ? <a href={href} target="_blank" rel="noreferrer" className="text-brand hover:underline">
            {orNotAvailable(value)}
          </a> : orNotAvailable(value)}
      </dd>
    </div>;
}
