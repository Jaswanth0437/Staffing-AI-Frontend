import Link from "next/link";
import { Eye, Users } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { CONTACT_TIER_LABELS } from "@/lib/constants";
import { formatDate, orNotAvailable } from "@/lib/utils";
export function LeadsTable({
  leads
}) {
  if (leads.length === 0) {
    return <EmptyState icon={<Users className="h-5 w-5" />} title="No leads found" description="Leads appear here once a qualified job is turned into a lead from a campaign." />;
  }
  return <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH>Contact</TH>
            <TH>Tier</TH>
            <TH>Job Title</TH>
            <TH>Company</TH>
            <TH>Email</TH>
            <TH>Phone</TH>
            <TH>Status</TH>
            <TH>Created</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {leads.map(lead => <TR key={lead.id}>
              <TD className="font-medium text-foreground">{orNotAvailable(lead.contact?.name)}</TD>
              <TD>
                <Badge tone="neutral">{CONTACT_TIER_LABELS[lead.contact?.type] ?? "Unknown"}</Badge>
              </TD>
              <TD className="text-muted-foreground">{orNotAvailable(lead.job?.job_title)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(lead.company?.company_name)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.email)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.phone)}</TD>
              <TD>
                <LeadStatusBadge status={lead.status} />
              </TD>
              <TD className="text-muted-foreground">{formatDate(lead.created_at)}</TD>
              <TD className="text-right">
                <Link href={`/campaigns/${lead.campaign_id}/leads/${lead.id}`} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
              </TD>
            </TR>)}
        </TBody>
      </Table>
    </TableContainer>;
}
