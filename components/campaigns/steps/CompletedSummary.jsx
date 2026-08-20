import { CheckCircle2 } from "lucide-react";
import { CardBody, CardHeader } from "@/components/ui/Card";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { useCampaignEmails } from "@/hooks/useCampaigns";
import { formatDateTime, orNotAvailable } from "@/lib/utils";
export function CompletedSummary({
  campaign
}) {
  const {
    data: emails,
    loading
  } = useCampaignEmails(campaign.id);
  return <>
      <CardHeader title={<span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Campaign Completed
          </span>} subtitle={`All leads were emailed. Completed ${formatDateTime(campaign.completed_at)}.`} />
      <CardBody>
        {!loading && emails && emails.length > 0 && <TableContainer>
            <Table>
              <THead>
                <TR>
                  <TH>Lead</TH>
                  <TH>Subject</TH>
                  <TH>Sent</TH>
                </TR>
              </THead>
              <TBody>
                {emails.map(e => <TR key={e.id}>
                    <TD className="font-medium text-foreground">{orNotAvailable(e.lead_name)}</TD>
                    <TD className="text-muted-foreground">{orNotAvailable(e.subject)}</TD>
                    <TD className="text-muted-foreground">{e.sent_at ? formatDateTime(e.sent_at) : "—"}</TD>
                  </TR>)}
              </TBody>
            </Table>
          </TableContainer>}
      </CardBody>
    </>;
}
