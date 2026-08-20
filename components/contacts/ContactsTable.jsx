import Link from "next/link";
import { Contact as ContactIcon } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CONTACT_TIER_LABELS } from "@/lib/constants";
import { orNotAvailable } from "@/lib/utils";
export function ContactsTable({
  contacts
}) {
  if (contacts.length === 0) {
    return <EmptyState icon={<ContactIcon className="h-5 w-5" />} title="No contacts found" description="Contacts appear here once a lead resolves one via Apollo." />;
  }
  return <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Tier</TH>
            <TH>Title</TH>
            <TH>Company</TH>
            <TH>Email</TH>
            <TH>Phone</TH>
            <TH>LinkedIn</TH>
            <TH>Source</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {contacts.map(contact => <TR key={contact.id}>
              <TD className="font-medium text-foreground">{orNotAvailable(contact.name)}</TD>
              <TD>
                <Badge tone="neutral">{CONTACT_TIER_LABELS[contact.contact_type] ?? "Unknown"}</Badge>
              </TD>
              <TD className="text-muted-foreground">{orNotAvailable(contact.designation)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(contact.company_name)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(contact.email)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(contact.phone)}</TD>
              <TD>
                {contact.linkedin_url ? <a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    View
                  </a> : <span className="text-muted-foreground">Not available</span>}
              </TD>
              <TD>
                <Badge tone="brand">{contact.source ?? "Apollo"}</Badge>
              </TD>
              <TD className="text-right">
                {contact.campaign_id ? <Link href={`/campaigns/${contact.campaign_id}/leads/${contact.lead_id}`} className="focus-ring inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                    View Lead
                  </Link> : <span className="text-muted-foreground">—</span>}
              </TD>
            </TR>)}
        </TBody>
      </Table>
    </TableContainer>;
}
