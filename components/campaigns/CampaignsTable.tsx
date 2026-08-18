import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { formatDate } from "@/lib/utils";
import type { Campaign } from "@/types/campaign";

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={<Megaphone className="h-5 w-5" />}
        title="No campaigns yet"
        description="Create your first outreach campaign to start engaging leads."
      />
    );
  }

  return (
    <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH>Campaign Name</TH>
            <TH>Leads</TH>
            <TH>Status</TH>
            <TH>Created</TH>
            <TH>Last Activity</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {campaigns.map((campaign) => (
            <TR key={campaign.id}>
              <TD>
                <Link href={`/campaigns/${campaign.id}`} className="font-medium text-foreground hover:text-brand">
                  {campaign.name}
                </Link>
              </TD>
              <TD className="text-muted-foreground">{campaign.leads_count}</TD>
              <TD>
                <CampaignStatusBadge status={campaign.status} />
              </TD>
              <TD className="text-muted-foreground">{formatDate(campaign.created_at)}</TD>
              <TD className="text-muted-foreground">
                {campaign.last_activity_at ? formatDate(campaign.last_activity_at) : "—"}
              </TD>
              <TD className="text-right">
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="focus-ring inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50"
                >
                  View
                </Link>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
}
