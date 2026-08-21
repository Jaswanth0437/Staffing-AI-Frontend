import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { orNotAvailable } from "@/lib/utils";
export function RecentLeadsTable({
  leads,
  loading
}) {
  const recent = leads?.slice(0, 5);
  return <Card>
      <CardHeader title="Recent Leads" subtitle="Newest Leads Added To Your CRM" action={<Link href="/leads" className="focus-ring rounded text-sm font-medium text-brand hover:underline">
            View All
          </Link>} />
      {loading && <TableSkeleton rows={5} cols={7} />}
      {!loading && recent && recent.length === 0 && <EmptyState icon={<Users className="h-5 w-5" />} title="No Leads Yet" description="Qualified Jobs Will Automatically Generate Leads Here." />}
      {!loading && recent && recent.length > 0 && <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Title</TH>
                <TH>Company</TH>
                <TH>Email</TH>
                <TH>Phone</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {recent.map(lead => <TR key={lead.id}>
                  <TD>
                    <Link href={`/campaigns/${lead.campaign_id}/leads/${lead.id}`} className="font-medium text-foreground hover:text-brand">
                      {lead.contact?.name ?? "Unknown"}
                    </Link>
                  </TD>
                  <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.job_title)}</TD>
                  <TD className="text-muted-foreground">{orNotAvailable(lead.company?.company_name)}</TD>
                  <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.email)}</TD>
                  <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.phone)}</TD>
                  <TD>
                    <LeadStatusBadge status={lead.status} />
                  </TD>
                </TR>)}
            </TBody>
          </Table>
        </TableContainer>}
    </Card>;
}
