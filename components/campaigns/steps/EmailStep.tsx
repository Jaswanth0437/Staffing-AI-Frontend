"use client";

import { useEffect, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useCampaignEmails, useCampaignLeads } from "@/hooks/useCampaigns";
import { generateCampaignEmail, sendCampaignEmails, updateCampaignEmail } from "@/lib/api";
import { orNotAvailable } from "@/lib/utils";
import type { CampaignEmail } from "@/types/campaign-email";

export function EmailStep({ campaignId, onSent }: { campaignId: string; onSent: () => void }) {
  const { data: leads, loading: leadsLoading } = useCampaignLeads(campaignId);
  const { data: emails, loading: emailsLoading, refetch } = useCampaignEmails(campaignId);
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, CampaignEmail>>({});

  const confirmedLeads = (leads ?? []).filter((l) => l.confirmed);

  useEffect(() => {
    if (!emails) return;
    // Merge server state into local drafts as it loads/refetches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrafts((prev) => {
      const next = { ...prev };
      emails.forEach((e) => {
        next[e.lead_id] = e;
      });
      return next;
    });
  }, [emails]);

  async function handleGenerate(leadId: string) {
    setGenerating(leadId);
    try {
      const email = await generateCampaignEmail(campaignId, leadId);
      setDrafts((prev) => ({ ...prev, [leadId]: email }));
    } catch (err) {
      toast({ tone: "error", title: "Failed to generate email", description: err instanceof Error ? err.message : undefined });
    } finally {
      setGenerating(null);
    }
  }

  function updateDraft(leadId: string, values: Partial<CampaignEmail>) {
    setDrafts((prev) => ({ ...prev, [leadId]: { ...prev[leadId], ...values } as CampaignEmail }));
  }

  async function persistDraft(leadId: string) {
    const draft = drafts[leadId];
    if (!draft) return;
    await updateCampaignEmail(draft.id, {
      from_email: draft.from_email,
      to_email: draft.to_email,
      subject: draft.subject,
      content: draft.content,
    });
  }

  function reportSendOutcome(results: CampaignEmail[]) {
    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed");
    if (sent > 0) {
      toast({ tone: "success", title: `${sent} email${sent === 1 ? "" : "s"} sent` });
    }
    if (failed.length > 0) {
      toast({
        tone: "error",
        title: `${failed.length} email${failed.length === 1 ? "" : "s"} failed to send`,
        description: "Missing a recipient, subject, or content — fill it in and try again.",
      });
    }
  }

  async function handleSend(leadId: string) {
    setSending(leadId);
    try {
      await persistDraft(leadId);
      const results = await sendCampaignEmails(campaignId, [leadId]);
      reportSendOutcome(results);
      refetch();
      onSent();
    } catch (err) {
      toast({ tone: "error", title: "Failed to send email", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSending(null);
    }
  }

  async function handleSendAll() {
    const targets = confirmedLeads.filter((l) => drafts[l.id]?.status === "draft");
    if (targets.length === 0) {
      toast({ tone: "error", title: "Generate emails before sending." });
      return;
    }
    setSendingAll(true);
    try {
      await Promise.all(targets.map((l) => persistDraft(l.id)));
      const results = await sendCampaignEmails(campaignId, targets.map((l) => l.id));
      reportSendOutcome(results);
      refetch();
      onSent();
    } catch (err) {
      toast({ tone: "error", title: "Failed to send emails", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSendingAll(false);
    }
  }

  return (
    <>
      <CardHeader
        title="Email Outreach"
        subtitle="Generate a pitch email per lead, review it, then send to one or all leads."
        action={
          <Button onClick={handleSendAll} loading={sendingAll} icon={<Send className="h-4 w-4" />}>
            Send All
          </Button>
        }
      />

      {(leadsLoading || emailsLoading) && <TableSkeleton rows={2} cols={3} />}

      <div className="flex flex-col gap-6 px-5 py-4">
        {!leadsLoading && !emailsLoading && confirmedLeads.map((lead) => {
          const draft = drafts[lead.id];
          const sent = draft?.status === "sent";
          return (
            <div key={lead.id} className="rounded-xl border border-border">
              <div className="flex items-center justify-between gap-4 border-b border-border bg-gray-50/60 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{orNotAvailable(lead.company?.company_name)}</p>
                  <p className="text-sm text-muted-foreground">{orNotAvailable(lead.job?.job_title)}</p>
                </div>
                {sent ? (
                  <Badge tone="success">Sent</Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                    loading={generating === lead.id}
                    onClick={() => handleGenerate(lead.id)}
                  >
                    {draft ? "Regenerate" : "Generate Email"}
                  </Button>
                )}
              </div>

              {draft && (
                <div className="flex flex-col gap-3 px-4 py-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      label="From"
                      value={draft.from_email}
                      disabled={sent}
                      onChange={(e) => updateDraft(lead.id, { from_email: e.target.value })}
                    />
                    <Input
                      label="To"
                      value={draft.to_email}
                      disabled={sent}
                      onChange={(e) => updateDraft(lead.id, { to_email: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Subject"
                    value={draft.subject}
                    disabled={sent}
                    onChange={(e) => updateDraft(lead.id, { subject: e.target.value })}
                  />
                  <Textarea
                    label="Content"
                    rows={7}
                    value={draft.content}
                    disabled={sent}
                    onChange={(e) => updateDraft(lead.id, { content: e.target.value })}
                  />
                  {!sent && (
                    <Button
                      className="self-end"
                      size="sm"
                      icon={<Send className="h-3.5 w-3.5" />}
                      loading={sending === lead.id}
                      onClick={() => handleSend(lead.id)}
                    >
                      Send
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
