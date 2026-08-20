"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { LeadFiltersBar, DEFAULT_LEAD_FILTERS } from "@/components/leads/LeadFiltersBar";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { BulkActionsBar } from "@/components/leads/BulkActionsBar";
import { useLeads } from "@/hooks/useLeads";
import { deleteLead, updateLeadStatus } from "@/lib/api";
import { LEAD_STATUS_OPTIONS } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
const PAGE_SIZE = 8;
export default function LeadsPage() {
  const {
    data: leads,
    loading,
    error,
    refetch
  } = useLeads();
  const {
    toast
  } = useToast();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [filters, setFilters] = useState(DEFAULT_LEAD_FILTERS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("contacted");
  const companies = useMemo(() => Array.from(new Set((leads ?? []).map(l => l.company?.company_name).filter(Boolean))), [leads]);
  const locations = useMemo(() => Array.from(new Set((leads ?? []).map(l => l.job?.job_location).filter(Boolean))), [leads]);
  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter(lead => {
      if (tab !== "all" && lead.status !== tab) return false;
      if (filters.leadType !== "all" && lead.lead_type !== filters.leadType) return false;
      if (filters.company !== "all" && lead.company?.company_name !== filters.company) return false;
      if (filters.location !== "all" && lead.job?.job_location !== filters.location) return false;
      if (filters.source !== "all" && lead.source !== filters.source) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${lead.contact?.name ?? ""} ${lead.contact?.email ?? ""} ${lead.company?.company_name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [leads, tab, filters, search]);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  function toggleSelected(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(prev => {
      const allSelected = paginated.every(l => prev.has(l.id));
      const next = new Set(prev);
      if (allSelected) paginated.forEach(l => next.delete(l.id));else paginated.forEach(l => next.add(l.id));
      return next;
    });
  }
  async function handleDelete(id) {
    try {
      await deleteLead(id);
      toast({
        tone: "success",
        title: "Lead deleted"
      });
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to delete lead",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setDeleteTarget(null);
    }
  }
  async function handleBulkDelete() {
    try {
      await Promise.all(Array.from(selected).map(id => deleteLead(id)));
      toast({
        tone: "success",
        title: `${selected.size} leads deleted`
      });
      setSelected(new Set());
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Bulk delete failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setBulkDeleteOpen(false);
    }
  }
  async function handleBulkStatusChange() {
    try {
      await Promise.all(Array.from(selected).map(id => updateLeadStatus(id, bulkStatus)));
      toast({
        tone: "success",
        title: `${selected.size} leads updated to ${titleCase(bulkStatus)}`
      });
      setSelected(new Set());
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Bulk update failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setStatusModalOpen(false);
    }
  }
  function handleExport() {
    toast({
      tone: "info",
      title: "Export started",
      description: `Exporting ${selected.size} leads.`
    });
  }
  const statusCounts = status => (leads ?? []).filter(l => l.status === status).length;
  return <div>
      <PageHeader title="Leads" subtitle="Manage qualified job opportunities and contacts." actions={<>
            <Button variant="outline" icon={<Upload className="h-4 w-4" />}>
              Import
            </Button>
            <Link href="/leads/new" className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-hover">
              <Plus className="h-4 w-4" />
              Add Lead
            </Link>
          </>} />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card>
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={search} onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }} placeholder="Search leads..." aria-label="Search leads" className="focus-ring h-9 w-full rounded-lg border border-border-strong bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground" />
            </div>

            <Tabs value={tab} onChange={v => {
          setTab(v);
          setPage(1);
        }} items={[{
          label: "All",
          value: "all",
          count: leads?.length ?? 0
        }, {
          label: "New",
          value: "new",
          count: statusCounts("new")
        }, {
          label: "Contacted",
          value: "contacted",
          count: statusCounts("contacted")
        }, {
          label: "Qualified",
          value: "qualified",
          count: statusCounts("qualified")
        }, {
          label: "Converted",
          value: "converted",
          count: statusCounts("converted")
        }, {
          label: "Rejected",
          value: "rejected",
          count: statusCounts("rejected")
        }]} />

            <LeadFiltersBar values={filters} onChange={v => {
          setFilters(v);
          setPage(1);
        }} companies={companies} locations={locations} />
          </div>

          {selected.size > 0 && <BulkActionsBar count={selected.size} onChangeStatus={() => setStatusModalOpen(true)} onExport={handleExport} onDelete={() => setBulkDeleteOpen(true)} />}

          {loading && <TableSkeleton rows={8} cols={11} />}

          {!loading && <LeadsTable leads={paginated} selected={selected} onToggle={toggleSelected} onToggleAll={toggleAll} onDelete={id => setDeleteTarget(id)} />}

          {!loading && filtered.length > 0 && <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />}
        </Card>}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete lead" footer={<>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </Button>
          </>}>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this lead? This action cannot be undone.
        </p>
      </Modal>

      <Modal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title={`Delete ${selected.size} leads`} footer={<>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleBulkDelete}>
              Delete
            </Button>
          </>}>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete {selected.size} selected leads? This action cannot be undone.
        </p>
      </Modal>

      <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)} title={`Change status for ${selected.size} leads`} footer={<>
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusChange}>Update Status</Button>
          </>}>
        <Select label="New status" value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} options={LEAD_STATUS_OPTIONS.map(v => ({
        label: titleCase(v),
        value: v
      }))} />
      </Modal>
    </div>;
}
