"use client";

import { use, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { useCampaign } from "@/hooks/useCampaigns";
import { sendCampaign } from "@/lib/api";
import { formatDate, orNotAvailable, titleCase } from "@/lib/utils";
import { Send, Users } from "lucide-react";

const STAT_TONE: Record<string, "neutral" | "brand" | "success" | "info" | "danger"> = {
  pending: "neutral",
  sent: "info",
  opened: "brand",
  replied: "success",
  failed: "danger",
};

export default function CampaignDetailsPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = use(params);
  const { data: campaign, loading, error, refetch } = useCampaign(campaignId);
  const { toast } = useToast();
  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);
    try {
      await sendCampaign(campaignId);
      toast({ tone: "success", title: "Campaign sent", description: "Emails are queued for delivery by the backend." });
      refetch();
    } catch (err) {
      toast({ tone: "error", title: "Failed to send campaign", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSending(false);
      setSendOpen(false);
    }
  }

  if (error) return <ErrorState description={error} onRetry={refetch} />;

  if (loading || !campaign) {
    return (
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  const stats = campaign.stats ?? { total: campaign.leads_count, sent: 0, opened: 0, replied: 0, failed: 0 };

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }, { label: campaign.name }]}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {campaign.name}
            <CampaignStatusBadge status={campaign.status} />
          </span>
        }
        subtitle={`Created ${formatDate(campaign.created_at)}`}
        actions={
          (campaign.status === "draft" || campaign.status === "paused") && (
            <Button icon={<Send className="h-4 w-4" />} onClick={() => setSendOpen(true)}>
              Send Campaign
            </Button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Total Leads" value={stats.total} />
        <StatTile label="Sent" value={stats.sent} />
        <StatTile label="Opened" value={stats.opened} />
        <StatTile label="Replied" value={stats.replied} />
        <StatTile label="Failed" value={stats.failed} />
      </div>

      <Card>
        <CardHeader title="Leads" subtitle="Delivery status for each lead in this campaign." />
        {!campaign.leads || campaign.leads.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No leads in this campaign yet"
            description="Leads will appear here once the campaign is sent."
          />
        ) : (
          <TableContainer>
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Company</TH>
                  <TH>Email</TH>
                  <TH>Status</TH>
                  <TH>Last Activity</TH>
                </TR>
              </THead>
              <TBody>
                {campaign.leads.map((lead) => (
                  <TR key={lead.lead_id}>
                    <TD className="font-medium text-foreground">{lead.name}</TD>
                    <TD className="text-muted-foreground">{lead.company}</TD>
                    <TD className="text-muted-foreground">{orNotAvailable(lead.email)}</TD>
                    <TD>
                      <Badge tone={STAT_TONE[lead.status]} dot>
                        {titleCase(lead.status)}
                      </Badge>
                    </TD>
                    <TD className="text-muted-foreground">
                      {lead.last_activity ? formatDate(lead.last_activity) : "—"}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Modal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        title="Send campaign"
        footer={
          <>
            <Button variant="outline" onClick={() => setSendOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} loading={sending} icon={<Send className="h-4 w-4" />}>
              Send Now
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          This will queue outreach emails for all {stats.total} leads in this campaign. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
