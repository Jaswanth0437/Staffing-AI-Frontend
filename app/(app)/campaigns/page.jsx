"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { CampaignsTable } from "@/components/campaigns/CampaignsTable";
import { useCampaigns } from "@/hooks/useCampaigns";
import { deleteCampaign, recheckCampaign } from "@/lib/api";
export default function CampaignsPage() {
  const {
    data: campaigns,
    loading,
    error,
    refetch
  } = useCampaigns();
  const {
    toast
  } = useToast();
  const [search, setSearch] = useState("");
  const [recheckTarget, setRecheckTarget] = useState(null);
  const [rechecking, setRechecking] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  const filtered = useMemo(() => {
    if (!campaigns) return [];
    if (!search) return campaigns;
    const q = search.toLowerCase();
    return campaigns.filter(c => `${c.name} ${c.role_name ?? ""}`.toLowerCase().includes(q));
  }, [campaigns, search]);

  async function handleRecheck() {
    if (!recheckTarget) return;
    setRechecking(true);
    try {
      await recheckCampaign(recheckTarget.id);
      toast({
        tone: "success",
        title: "Recheck started",
        description: `${recheckTarget.name} is fetching the latest postings.`
      });
      setRecheckTarget(null);
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Recheck failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setRechecking(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setRemoving(true);
    try {
      await deleteCampaign(deleteTarget.id);
      toast({
        tone: "success",
        title: "Campaign deleted"
      });
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to delete campaign",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setRemoving(false);
    }
  }

  return <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Campaigns" subtitle="Create a campaign to pull jobs from Apify, then work each job through to a lead and an email." actions={<Link href="/campaigns/new" title="New campaign" className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-hover">
            <Plus className="h-4 w-4" />
            New Campaign
          </Link>} />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card className="flex flex-1 min-h-[34rem] flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border px-5 py-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns..." aria-label="Search campaigns" title="Search campaigns" className="focus-ring h-9 w-full rounded-lg border border-border-strong bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-1 min-h-0 flex-col">
            {loading && <TableSkeleton rows={4} cols={6} />}
            {!loading && <CampaignsTable campaigns={filtered} recheckingId={rechecking ? recheckTarget?.id : null} onRecheckRequest={setRecheckTarget} onDeleteRequest={setDeleteTarget} />}
          </div>
        </Card>}

      <ConfirmDialog open={!!recheckTarget} title="Recheck Campaign" description={`Fetch the latest postings for "${recheckTarget?.name}"? Jobs already on file are kept as-is — only genuinely new postings are added and tagged "New".`} confirmLabel="Recheck" loading={rechecking} onConfirm={handleRecheck} onClose={() => setRecheckTarget(null)} />

      <ConfirmDialog open={!!deleteTarget} title="Delete Campaign" description={<>
            Are you sure you want to delete <span className="font-medium">{deleteTarget?.name}</span>? This permanently deletes every job, lead, contact, employee match, and email under this campaign. This can&apos;t be undone.
          </>} confirmLabel="Delete" tone="danger" loading={removing} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
    </div>;
}
