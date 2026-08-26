import Link from "next/link";
import { Eye, Users } from "lucide-react";
import { SortableTH, Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { CONTACT_TIER_LABELS } from "@/lib/constants";
import { formatDate, orNotAvailable } from "@/lib/utils";
export function LeadsTable({
  leads,
  sortKey,
  sortDir,
  onSort
}) {
  if (leads.length === 0) {
    return <div className="flex flex-1 items-center justify-center">
        <EmptyState icon={<Users className="h-5 w-5" />} title="No leads found" description="Leads appear here once a qualified job is turned into a lead from a campaign." />
      </div>;
  }
  const sortProps = { activeSortKey: sortKey, sortDir, onSort };
  return <TableContainer className="flex-1 min-h-0 overflow-y-auto">
      <Table>
        <THead className="sticky top-0 z-10 bg-gray-50">
          <TR>
            <SortableTH sortKey="contact.name" {...sortProps}>Contact</SortableTH>
            <SortableTH sortKey="contact.type" {...sortProps}>Tier</SortableTH>
            <SortableTH sortKey="job.job_title" {...sortProps}>Job Title</SortableTH>
            <SortableTH sortKey="company.company_name" {...sortProps}>Company</SortableTH>
            <TH>Email</TH>
            <TH>Phone</TH>
            <SortableTH sortKey="status" {...sortProps}>Status</SortableTH>
            <SortableTH sortKey="created_at" {...sortProps}>Created</SortableTH>
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
                <Link href={`/campaigns/${lead.campaign_id}/leads/${lead.id}`} title="View lead" className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
              </TD>
            </TR>)}
        </TBody>
      </Table>
    </TableContainer>;
}
