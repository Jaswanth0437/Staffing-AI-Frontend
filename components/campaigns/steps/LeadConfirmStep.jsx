"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { CardHeader } from "@/components/ui/Card";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useCampaignLeads } from "@/hooks/useCampaigns";
import { confirmCampaignLeads } from "@/lib/api";
import { orNotAvailable } from "@/lib/utils";
export function LeadConfirmStep({
  campaignId,
  onAdvanced
}) {
  const {
    data: leads,
    loading
  } = useCampaignLeads(campaignId);
  const {
    toast
  } = useToast();
  const [selected, setSelected] = useState(new Set());
  const [confirming, setConfirming] = useState(false);
  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    if (!leads) return;
    setSelected(prev => prev.size === leads.length ? new Set() : new Set(leads.map(l => l.id)));
  }
  async function handleNext() {
    if (selected.size === 0) {
      toast({
        tone: "error",
        title: "Select at least one lead to proceed."
      });
      return;
    }
    setConfirming(true);
    try {
      await confirmCampaignLeads(campaignId, Array.from(selected));
      onAdvanced();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to confirm leads",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setConfirming(false);
    }
  }
  return <>
      <CardHeader title="Confirm Leads" subtitle="Select the leads to proceed with. At least one lead must be selected." />

      {loading && <TableSkeleton rows={4} cols={4} />}

      {!loading && (!leads || leads.length === 0) && <EmptyState icon={<Users className="h-5 w-5" />} title="No leads yet" description="Go back and move some qualified jobs to Lead first." />}

      {!loading && leads && leads.length > 0 && <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH className="w-10">
                  <Checkbox checked={selected.size === leads.length} onChange={toggleAll} aria-label="Select all leads" />
                </TH>
                <TH>Company</TH>
                <TH>Contact</TH>
                <TH>Job Title</TH>
              </TR>
            </THead>
            <TBody>
              {leads.map(lead => <TR key={lead.id}>
                  <TD>
                    <Checkbox checked={selected.has(lead.id)} onChange={() => toggle(lead.id)} aria-label={`Select ${lead.company?.company_name ?? lead.id}`} />
                  </TD>
                  <TD className="font-medium text-foreground">{orNotAvailable(lead.company?.company_name)}</TD>
                  <TD className="text-muted-foreground">{orNotAvailable(lead.contact?.name)}</TD>
                  <TD className="text-muted-foreground">{orNotAvailable(lead.job?.job_title)}</TD>
                </TR>)}
            </TBody>
          </Table>
        </TableContainer>}

      <div className="flex items-center justify-between border-t border-border px-5 py-4">
        <p className="text-sm text-muted-foreground">
          {selected.size} of {leads?.length ?? 0} selected
        </p>
        <Button onClick={handleNext} loading={confirming} disabled={!leads || leads.length === 0}>
          Next
        </Button>
      </div>
    </>;
}
