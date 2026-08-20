import Link from "next/link";
import { Megaphone, RotateCw } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { formatDate } from "@/lib/utils";
export function CampaignsTable({
  campaigns,
  jobs,
  leads,
  onRecheck,
  recheckingId
}) {
  if (campaigns.length === 0) {
    return <EmptyState icon={<Megaphone className="h-5 w-5" />} title="No campaigns yet" description="Create your first campaign to start pulling jobs from Apify." />;
  }
  return <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH>Campaign Name</TH>
            <TH>Role</TH>
            <TH>Status</TH>
            <TH>Qualified</TH>
            <TH>Rejected</TH>
            <TH>Leads</TH>
            <TH>Created</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {campaigns.map(campaign => {
          const campaignJobs = jobs.filter(j => j.campaign_id === campaign.id);
          const qualifiedCount = campaignJobs.filter(j => j.status === "qualified" || j.qualified).length;
          const rejectedCount = campaignJobs.length - qualifiedCount;
          const leadCount = leads.filter(l => l.campaign_id === campaign.id).length;
          return <TR key={campaign.id}>
                <TD>
                  <Link href={`/campaigns/${campaign.id}`} className="font-medium text-foreground hover:text-brand">
                    {campaign.name}
                  </Link>
                </TD>
                <TD className="text-muted-foreground">{campaign.role_name}</TD>
                <TD>
                  <CampaignStatusBadge status={campaign.status} />
                </TD>
                <TD className="text-muted-foreground">{qualifiedCount}</TD>
                <TD className="text-muted-foreground">{rejectedCount}</TD>
                <TD className="text-muted-foreground">{leadCount}</TD>
                <TD className="text-muted-foreground">{formatDate(campaign.created_at)}</TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" icon={<RotateCw className="h-3.5 w-3.5" />} loading={recheckingId === campaign.id} onClick={() => onRecheck(campaign)}>
                      Recheck
                    </Button>
                    <Link href={`/campaigns/${campaign.id}`} className="focus-ring inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                      View
                    </Link>
                  </div>
                </TD>
              </TR>;
        })}
        </TBody>
      </Table>
    </TableContainer>;
}
