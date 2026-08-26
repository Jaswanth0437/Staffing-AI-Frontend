import Link from "next/link";
import { Megaphone, RefreshCw, Trash2 } from "lucide-react";
import { SortableTH, Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { useSortableData } from "@/hooks/useSortableData";
import { formatDateTime } from "@/lib/utils";
export function CampaignsTable({
  campaigns,
  recheckingId,
  onRecheckRequest,
  onDeleteRequest
}) {
  const { sorted, sortKey, sortDir, requestSort } = useSortableData(campaigns, "created_at", "desc");
  if (campaigns.length === 0) {
    return <div className="flex flex-1 items-center justify-center">
        <EmptyState icon={<Megaphone className="h-5 w-5" />} title="No campaigns found" description="Create your first campaign to start pulling jobs from Apify." />
      </div>;
  }
  const sortProps = { activeSortKey: sortKey, sortDir, onSort: requestSort };
  return <TableContainer className="flex-1 min-h-0 overflow-y-auto">
      <Table>
        <THead className="sticky top-0 z-10 bg-gray-50">
          <TR>
            <SortableTH sortKey="name" {...sortProps}>Campaign Name</SortableTH>
            <SortableTH sortKey="role_name" {...sortProps}>Role</SortableTH>
            <SortableTH sortKey="status" {...sortProps}>Status</SortableTH>
            <SortableTH sortKey="created_at" {...sortProps}>Created</SortableTH>
            <SortableTH sortKey="last_checked_at" {...sortProps}>Last Checked</SortableTH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {sorted.map(campaign => <TR key={campaign.id}>
              <TD>
                <Link href={`/campaigns/${campaign.id}`} className="font-medium text-foreground hover:text-brand">
                  {campaign.name}
                </Link>
              </TD>
              <TD className="text-muted-foreground">{campaign.role_name}</TD>
              <TD>
                <CampaignStatusBadge status={campaign.status} />
              </TD>
              <TD className="text-muted-foreground">{formatDateTime(campaign.created_at)}</TD>
              <TD className="text-muted-foreground">{campaign.last_checked_at ? formatDateTime(campaign.last_checked_at) : "Never"}</TD>
              <TD className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/campaigns/${campaign.id}`} title="View campaign" className="focus-ring inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                    View
                  </Link>
                  <Button variant="outline" size="icon" title="Recheck campaign" aria-label="Recheck campaign" loading={recheckingId === campaign.id} disabled={campaign.status === "running"} onClick={() => onRecheckRequest(campaign)}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" title="Delete campaign" aria-label="Delete campaign" onClick={() => onDeleteRequest(campaign)}>
                    <Trash2 className="h-3.5 w-3.5 text-danger" />
                  </Button>
                </div>
              </TD>
            </TR>)}
        </TBody>
      </Table>
    </TableContainer>;
}
