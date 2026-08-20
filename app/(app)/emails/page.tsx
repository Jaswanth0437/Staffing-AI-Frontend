"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmailDetailModal } from "@/components/emails/EmailDetailModal";
import { useEmails } from "@/hooks/useEmails";
import { formatDateTime, orNotAvailable } from "@/lib/utils";
import type { CampaignEmail } from "@/types/campaign-email";

const STATUS_TONE: Record<CampaignEmail["status"], "neutral" | "success" | "danger"> = {
  draft: "neutral",
  sent: "success",
  failed: "danger",
};

export default function EmailsPage() {
  const { data: emails, loading, error, refetch } = useEmails();
  const [selected, setSelected] = useState<CampaignEmail | null>(null);

  return (
    <div>
      <PageHeader title="Emails" subtitle="Every outreach email drafted or sent across all campaigns." />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && (
        <Card>
          {loading && <TableSkeleton rows={5} cols={5} />}

          {!loading && (!emails || emails.length === 0) && (
            <EmptyState
              icon={<Mail className="h-5 w-5" />}
              title="No emails yet"
              description="Emails will appear here once a campaign generates outreach for a lead."
            />
          )}

          {!loading && emails && emails.length > 0 && (
            <TableContainer>
              <Table>
                <THead>
                  <TR>
                    <TH>Lead</TH>
                    <TH>Campaign</TH>
                    <TH>Subject</TH>
                    <TH>Status</TH>
                    <TH>Sent</TH>
                  </TR>
                </THead>
                <TBody>
                  {emails.map((email) => (
                    <TR key={email.id} className="cursor-pointer" onClick={() => setSelected(email)}>
                      <TD className="font-medium text-foreground">{orNotAvailable(email.lead_name)}</TD>
                      <TD className="text-muted-foreground">{email.campaign_name}</TD>
                      <TD className="text-muted-foreground">{orNotAvailable(email.subject)}</TD>
                      <TD>
                        <Badge tone={STATUS_TONE[email.status]} dot>
                          {email.status}
                        </Badge>
                      </TD>
                      <TD className="text-muted-foreground">{email.sent_at ? formatDateTime(email.sent_at) : "—"}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      <EmailDetailModal email={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
