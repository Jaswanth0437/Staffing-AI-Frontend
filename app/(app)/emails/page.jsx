"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Mail, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmailDetailModal } from "@/components/emails/EmailDetailModal";
import { useEmails } from "@/hooks/useEmails";
import { formatDateTime, orNotAvailable, titleCase } from "@/lib/utils";
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
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!emails) return [];
    if (!search) return emails;
    const q = search.toLowerCase();
    return emails.filter(e => `${e.recipient ?? ""} ${e.subject ?? ""}`.toLowerCase().includes(q));
  }, [emails, search]);

  return <div className="flex h-full flex-col">
      <PageHeader title="Emails" subtitle="Every outreach email drafted or sent across all campaigns." />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card className="flex flex-1 min-h-[34rem] flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border px-5 py-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search emails..." aria-label="Search emails" title="Search emails" className="focus-ring h-9 w-full rounded-lg border border-border-strong bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-1 min-h-0 flex-col">
          {loading && <TableSkeleton rows={5} cols={4} />}

          {!loading && (!emails || emails.length === 0) && <div className="flex flex-1 items-center justify-center"><EmptyState icon={<Mail className="h-5 w-5" />} title="No emails yet" description="Emails will appear here once a lead's outreach copy has been generated." /></div>}

          {!loading && emails && emails.length > 0 && filtered.length === 0 && <div className="flex flex-1 items-center justify-center"><EmptyState icon={<Mail className="h-5 w-5" />} title="No emails found" description="Try adjusting your search." /></div>}

          {!loading && filtered.length > 0 && <TableContainer className="flex-1 min-h-0 overflow-y-auto">
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
                  {filtered.map(email => <TR key={email.id} className="cursor-pointer" onClick={() => setSelected(email)}>
                      <TD className="font-medium text-foreground">{orNotAvailable(email.recipient)}</TD>
                      <TD className="text-muted-foreground">{orNotAvailable(email.subject)}</TD>
                      <TD>
                        <Badge tone={STATUS_TONE[email.status]} dot>
                          {titleCase(email.status)}
                        </Badge>
                      </TD>
                      <TD className="text-muted-foreground">{email.sent_at ? formatDateTime(email.sent_at) : "—"}</TD>
                      <TD className="text-right">
                        {email.campaign_id && <Link href={`/campaigns/${email.campaign_id}/leads/${email.lead_id}`} onClick={e => e.stopPropagation()} title="View lead" className="focus-ring inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                            <Eye className="h-3.5 w-3.5" />
                            View Lead
                          </Link>}
                      </TD>
                    </TR>)}
                </TBody>
              </Table>
            </TableContainer>}
          </div>
        </Card>}

      <EmailDetailModal email={selected} onClose={() => setSelected(null)} />
    </div>;
}
