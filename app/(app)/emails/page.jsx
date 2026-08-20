"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Mail } from "lucide-react";
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
const STATUS_TONE = {
  draft: "neutral",
  sent: "success",
  failed: "danger"
};
export default function EmailsPage() {
  const {
    data: emails,
    loading,
    error,
    refetch
  } = useEmails();
  const [selected, setSelected] = useState(null);
  return <div>
      <PageHeader title="Emails" subtitle="Every outreach email drafted or sent across all campaigns." />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card>
          {loading && <TableSkeleton rows={5} cols={4} />}

          {!loading && (!emails || emails.length === 0) && <EmptyState icon={<Mail className="h-5 w-5" />} title="No emails yet" description="Emails will appear here once a lead's outreach copy has been generated." />}

          {!loading && emails && emails.length > 0 && <TableContainer>
              <Table>
                <THead>
                  <TR>
                    <TH>Recipient</TH>
                    <TH>Subject</TH>
                    <TH>Status</TH>
                    <TH>Sent</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {emails.map(email => <TR key={email.id} className="cursor-pointer" onClick={() => setSelected(email)}>
                      <TD className="font-medium text-foreground">{orNotAvailable(email.recipient)}</TD>
                      <TD className="text-muted-foreground">{orNotAvailable(email.subject)}</TD>
                      <TD>
                        <Badge tone={STATUS_TONE[email.status]} dot>
                          {email.status}
                        </Badge>
                      </TD>
                      <TD className="text-muted-foreground">{email.sent_at ? formatDateTime(email.sent_at) : "—"}</TD>
                      <TD className="text-right">
                        {email.campaign_id && <Link href={`/campaigns/${email.campaign_id}/leads/${email.lead_id}`} onClick={e => e.stopPropagation()} className="focus-ring inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                            <Eye className="h-3.5 w-3.5" />
                            View Lead
                          </Link>}
                      </TD>
                    </TR>)}
                </TBody>
              </Table>
            </TableContainer>}
        </Card>}

      <EmailDetailModal email={selected} onClose={() => setSelected(null)} />
    </div>;
}
