"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { useLeads } from "@/hooks/useLeads";
const PAGE_SIZE = 10;

// Real backend lead.status enum (see backend/models.py's Lead).
const STATUS_TABS = ["new", "contacted", "replied", "closed"];

export default function LeadsPage() {
  const {
    data: leads,
    loading,
    error,
    refetch
  } = useLeads();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter(lead => {
      if (tab !== "all" && lead.status !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${lead.contact?.name ?? ""} ${lead.contact?.email ?? ""} ${lead.company?.company_name ?? ""} ${lead.job?.job_title ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [leads, tab, search]);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const statusCount = status => (leads ?? []).filter(l => l.status === status).length;

  return <div className="flex h-full flex-col">
      <PageHeader title="Leads" subtitle="Every lead created from a qualified job across all campaigns." />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card className="flex flex-1 min-h-[34rem] flex-col overflow-hidden">
          <div className="shrink-0 flex flex-col gap-4 border-b border-border px-5 py-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={search} onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }} placeholder="Search leads..." aria-label="Search leads" title="Search leads" className="focus-ring h-9 w-full rounded-lg border border-border-strong bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground" />
            </div>

            <Tabs value={tab} onChange={v => {
          setTab(v);
          setPage(1);
        }} items={[{
          label: "All",
          value: "all",
          count: leads?.length ?? 0
        }, ...STATUS_TABS.map(status => ({
          label: status[0].toUpperCase() + status.slice(1),
          value: status,
          count: statusCount(status)
        }))]} />
          </div>

          <div className="flex flex-1 min-h-0 flex-col">
            {loading && <TableSkeleton rows={8} cols={9} />}
            {!loading && <LeadsTable leads={paginated} />}
          </div>

          {!loading && filtered.length > 0 && <div className="shrink-0"><Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} /></div>}
        </Card>}
    </div>;
}
