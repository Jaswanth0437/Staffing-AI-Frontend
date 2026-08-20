import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { CampaignStageBadge } from "./CampaignStageBadge";
import { formatDate } from "@/lib/utils";
import type { Campaign } from "@/types/campaign";
import type { Job } from "@/types/job";
import type { Lead } from "@/types/lead";

export function CampaignsTable({
  campaigns,
  jobs,
  leads,
}: {
  campaigns: Campaign[];
  jobs: Job[];
  leads: Lead[];
}) {
  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={<Megaphone className="h-5 w-5" />}
        title="No campaigns yet"
        description="Run a search from the Search tab to create your first campaign."
      />
    );
  }

  return (
    <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH>Campaign Name</TH>
            <TH>Role</TH>
            <TH>Jobs</TH>
            <TH>Leads</TH>
            <TH>Stage</TH>
            <TH>Created</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {campaigns.map((campaign) => {
            const jobCount = jobs.filter((j) => j.campaign_id === campaign.id).length;
            const leadCount = leads.filter((l) => l.campaign_id === campaign.id).length;
            return (
              <TR key={campaign.id}>
                <TD>
                  <Link href={`/campaigns/${campaign.id}`} className="font-medium text-foreground hover:text-brand">
                    {campaign.name}
                  </Link>
                </TD>
                <TD className="text-muted-foreground">{campaign.role_name}</TD>
                <TD className="text-muted-foreground">{jobCount}</TD>
                <TD className="text-muted-foreground">{leadCount}</TD>
                <TD>
                  <CampaignStageBadge stage={campaign.stage} />
                </TD>
                <TD className="text-muted-foreground">{formatDate(campaign.created_at)}</TD>
                <TD className="text-right">
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="focus-ring inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50"
                  >
                    View
                  </Link>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </TableContainer>
  );
}
