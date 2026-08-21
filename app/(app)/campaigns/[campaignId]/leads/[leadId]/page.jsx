"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, Send, Sparkles, Users, XCircle } from "lucide-react";
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
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import { generateEmailForLead, getEmailForLead, getPipelineLead, getLeadMatches, matchEmployeesForLead, regenerateEmail, sendEmail, updateEmail } from "@/lib/api";
import { CONTACT_TIER_LABELS } from "@/lib/constants";
import { initials, orNotAvailable } from "@/lib/utils";

function buildSignature(name) {
  return `\n\nThanks and Regards\n${name}\nWinfomi - Salesforce CREST Partner\nPh: +91 82482 52320 | US: +1 (615) 314-6998`;
}
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
  const currentUser = useCurrentUser();
  const {
    data: lead,
    loading: leadLoading,
    error,
    refetch: refetchLead
  } = useAsyncData(() => getPipelineLead(leadId), [leadId]);
  const {
    data: matches,
    loading: matchesLoading,
    refetch: refetchMatches
  } = useAsyncData(() => getLeadMatches(leadId), [leadId]);
  // Hydrates the draft below on first load if this lead already has an
  // email (e.g. reopening an already-Contacted lead) — not just right
  // after generating/sending one in this session.
  const {
    data: existingEmail
  } = useAsyncData(() => getEmailForLead(leadId), [leadId]);
  const [matching, setMatching] = useState(false);
  const [matchReason, setMatchReason] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (existingEmail && !draft) setDraft(existingEmail);
  }, [existingEmail, draft]);

  const hasConfirmedMatch = Boolean(matches?.some(m => m.confirmed));

  async function handleMatch() {
    setMatching(true);
    setMatchReason(null);
    try {
      const result = await matchEmployeesForLead(leadId);
      setMatchReason(result.reason);
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
  async function handleGenerate() {
    setGenerating(true);
    try {
      // Only the very first generate uses POST /leads/{id}/generate-email;
      // once an email row exists, further attempts go through
      // POST /emails/{id}/regenerate instead (both overwrite in place).
      const result = draft?.id ? await regenerateEmail(draft.id) : await generateEmailForLead(leadId);
      // The backend never knows who's operating the platform — stamp the
      // real "From" identity and the standard sign-off client-side, over
      // the backend's generic placeholder sender/body.
      setDraft({
        ...result,
        sender: currentUser.email || result.sender,
        body: `${result.body}${buildSignature(currentUser.name)}`
      });
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
      await updateEmail(draft.id, {
        sender: draft.sender,
        recipient: draft.recipient,
        subject: draft.subject,
        body: draft.body
      });
      const sent = await sendEmail(draft.id);
      setDraft(sent);
      refetchLead();
      toast({
        tone: "success",
        title: "Email sent",
        description: "Lead status moved to Contacted."
      });
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
  const sent = draft?.status === "sent";
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Campaigns",
      href: "/campaigns"
    }, {
      label: "Campaign",
      href: `/campaigns/${campaignId}`
    }, {
      label: "Lead"
    }]} title={<span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
              {initials(contact.name ?? lead.company?.company_name ?? "Lead")}
            </span>
            {contact.name ?? lead.company?.company_name ?? "Lead"}
          </span>} subtitle={lead.job?.job_title} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader title={<span className="flex items-center gap-2">
                  Employee Match
                  {!matchesLoading && matches && (hasConfirmedMatch ? <Badge tone="success"><CheckCircle2 className="h-3 w-3" />Match Found</Badge> : <Badge tone="neutral"><XCircle className="h-3 w-3" />No Match Found</Badge>)}
                </span>} subtitle="Internal review only — never shown to the recipient. The top-ranked candidate is used for outreach automatically." action={<Button variant="outline" size="sm" icon={<Sparkles className="h-3.5 w-3.5" />} loading={matching} onClick={handleMatch}>
                  {matches && matches.length > 0 ? "Re-match" : "Find Matching Employees"}
                </Button>} />
            {matchesLoading && <CardBody>
                <Skeleton className="h-24 w-full" />
              </CardBody>}
            {!matchesLoading && (!matches || matches.length === 0) && (matchReason === "no_qualifying_employees" ? <EmptyState icon={<Users className="h-5 w-5" />} title="No qualifying employees found" description="The AI reviewed the bench and determined none are a reasonable fit for this specific role — a legitimate result, not an error." /> : <EmptyState icon={<Users className="h-5 w-5" />} title="No matches yet" description="Run matching to rank employees against this job's requirements." />)}
            {!matchesLoading && matches && matches.length > 0 && <div className="max-h-[22rem] divide-y divide-border overflow-y-auto">
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
                      {m.confirmed && <Badge tone="info">Used for outreach</Badge>}
                    </div>
                  </div>)}
              </div>}
          </Card>

          <Card>
            <CardHeader title="Email Review" subtitle="Editable before sending — no employee name or PII is referenced in the copy." action={<Button variant="outline" size="sm" icon={<Sparkles className="h-3.5 w-3.5" />} loading={generating} onClick={handleGenerate} disabled={!hasConfirmedMatch}>
                  {draft ? "Regenerate" : "Generate Email"}
                </Button>} />
            {!draft && <CardBody>
                <p className="text-sm text-muted-foreground">
                  {hasConfirmedMatch ? "Click Generate Email to draft the outreach copy." : "Find a matching employee above before generating an email."}
                </p>
              </CardBody>}
            {draft && <CardBody className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input label="From" value={draft.sender ?? ""} disabled={sent} onChange={e => setDraft(prev => ({
                ...prev,
                sender: e.target.value
              }))} />
                  <Input label="To" value={draft.recipient ?? ""} disabled={sent} onChange={e => setDraft(prev => ({
                ...prev,
                recipient: e.target.value
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
                {sent ? <Badge tone="success" className="self-start">Sent</Badge> : <Button className="self-end" icon={<Send className="h-4 w-4" />} loading={sending} disabled={!draft.recipient} onClick={handleSend}>
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
                </dl>
                {lead.company.company_name && <Link href={`/companies/${encodeURIComponent(lead.company.company_name)}`} className="focus-ring mt-3 inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                    View Company Profile
                  </Link>}
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
