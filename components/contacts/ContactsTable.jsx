import Link from "next/link";
import { Contact as ContactIcon } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatDate, orNotAvailable } from "@/lib/utils";
export function ContactsTable({
  contacts
}) {
  if (contacts.length === 0) {
    return <EmptyState icon={<ContactIcon className="h-5 w-5" />} title="No contacts found" description="Try adjusting your search or filters." />;
  }
  return <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Title</TH>
            <TH>Company</TH>
            <TH>Email</TH>
            <TH>Phone</TH>
            <TH>LinkedIn</TH>
            <TH>Source</TH>
            <TH>Last Updated</TH>
          </TR>
        </THead>
        <TBody>
          {contacts.map(contact => <TR key={contact.id}>
              <TD>
                <Link href={`/contacts/${contact.id}`} className="font-medium text-foreground hover:text-brand">
                  {contact.name}
                </Link>
              </TD>
              <TD className="text-muted-foreground">{orNotAvailable(contact.job_title)}</TD>
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
              <TD className="text-muted-foreground">{formatDate(contact.updated_at)}</TD>
            </TR>)}
        </TBody>
      </Table>
    </TableContainer>;
}
