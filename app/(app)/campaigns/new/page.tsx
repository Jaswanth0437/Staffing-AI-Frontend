"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { CampaignStepper } from "@/components/campaigns/CampaignStepper";
import { LeadSelector } from "@/components/campaigns/LeadSelector";
import { MessageEditor } from "@/components/campaigns/MessageEditor";
import { useLeads } from "@/hooks/useLeads";
import { createCampaign } from "@/lib/api";
import { orNotAvailable } from "@/lib/utils";

const STEPS = [
  { label: "Campaign Details", value: 1 },
  { label: "Select Leads", value: 2 },
  { label: "Message", value: 3 },
  { label: "Review", value: 4 },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: leads } = useLeads();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState("all");
  const [subject, setSubject] = useState("Quick question about your {{job_title}} role");
  const [body, setBody] = useState(
    "Hi {{first_name}},\n\nI noticed {{company}} is hiring for a {{job_title}} role. We help teams like yours find qualified candidates faster.\n\nWorth a quick chat this week?\n\nBest,\nThe LeadFlow Team",
  );
  const [saving, setSaving] = useState(false);

  function toggleLead(id: string) {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave(asDraft: boolean) {
    setSaving(true);
    try {
      const campaign = await createCampaign({
        name: name || "Untitled campaign",
        leads_count: selectedLeads.size,
        subject,
        body,
      });
      toast({
        tone: "success",
        title: asDraft ? "Draft saved" : "Campaign created",
        description: `${campaign.name} created with ${selectedLeads.size} leads.`,
      });
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      toast({ tone: "error", title: "Failed to save campaign", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  }

  const selectedLeadObjects = (leads ?? []).filter((l) => selectedLeads.has(l.id));

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }, { label: "Create Campaign" }]}
        title="Create Campaign"
        subtitle="Build a targeted outreach campaign from your qualified leads."
      />

      <Card className="mb-6 px-5 py-4">
        <CampaignStepper steps={STEPS} current={step} />
      </Card>

      <Card>
        {step === 1 && (
          <>
            <CardHeader title="Campaign Details" />
            <CardBody className="max-w-md">
              <Input
                label="Campaign name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. August AI/ML Outreach"
                required
              />
            </CardBody>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader title="Select Leads" subtitle="Choose which leads to include in this campaign." />
            <CardBody>
              <LeadSelector
                leads={leads ?? []}
                selected={selectedLeads}
                onToggle={toggleLead}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            </CardBody>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader title="Message" subtitle="Compose the outreach email for this campaign." />
            <CardBody className="max-w-2xl">
              <MessageEditor subject={subject} body={body} onSubjectChange={setSubject} onBodyChange={setBody} />
            </CardBody>
          </>
        )}

        {step === 4 && (
          <>
            <CardHeader title="Review" subtitle="Confirm your campaign details before saving." />
            <CardBody className="flex flex-col gap-5">
              <div>
                <p className="text-xs text-muted-foreground">Campaign name</p>
                <p className="text-sm font-medium text-foreground">{orNotAvailable(name)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Leads selected</p>
                <p className="text-sm font-medium text-foreground">{selectedLeadObjects.length} leads</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="text-sm font-medium text-foreground">{orNotAvailable(subject)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Body preview</p>
                <p className="whitespace-pre-line rounded-lg border border-border bg-gray-50 p-3 text-sm text-foreground">
                  {body}
                </p>
              </div>
            </CardBody>
          </>
        )}

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSave(true)} loading={saving}>
              Save Draft
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep((s) => Math.min(4, s + 1))}>Continue</Button>
            ) : (
              <Button onClick={() => handleSave(false)} loading={saving}>
                Create Campaign
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
