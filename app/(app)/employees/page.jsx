"use client";

import { useMemo, useState } from "react";
import { IdCard, Pencil, RefreshCw, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { EmployeeEditModal } from "@/components/employees/EmployeeEditModal";
import { useEmployees } from "@/hooks/useEmployees";
import { deleteEmployee, syncEmployees, updateEmployee } from "@/lib/api";
import { orNotAvailable } from "@/lib/utils";
export default function EmployeesPage() {
  const {
    data: employees,
    loading,
    error,
    refetch
  } = useEmployees();
  const {
    toast
  } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!employees) return [];
    if (!search) return employees;
    const q = search.toLowerCase();
    return employees.filter(e => `${e.name} ${e.role_title ?? ""} ${(e.skills ?? []).join(" ")}`.toLowerCase().includes(q));
  }, [employees, search]);

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await syncEmployees();
      toast({
        tone: "success",
        title: "Employees synced",
        description: `${result.synced} record(s) pulled from ${result.source}${result.fallback_reason ? ` (Salesforce unavailable: ${result.fallback_reason})` : ""}.`
      });
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Sync failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setSyncing(false);
    }
  }

  async function handleSave(employeeId, values) {
    setSaving(true);
    try {
      await updateEmployee(employeeId, values);
      toast({ tone: "success", title: "Resource updated" });
      setEditing(null);
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Update failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteEmployee(deleting.id);
      toast({ tone: "success", title: "Resource deleted" });
      setDeleting(null);
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Delete failed",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setRemoving(false);
    }
  }

  return <div className="flex h-full flex-col">
      <PageHeader title="Resources" subtitle="Your bench, synced from Salesforce — matched against lead job requirements in the campaign flow." actions={<Button title="Sync from Salesforce" icon={<RefreshCw className="h-4 w-4" />} loading={syncing} onClick={handleSync}>
            Sync from Salesforce
          </Button>} />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card className="flex flex-1 min-h-[34rem] flex-col overflow-hidden">
          <div className="shrink-0 border-b border-border px-5 py-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." aria-label="Search resources" title="Search resources" className="focus-ring h-9 w-full rounded-lg border border-border-strong bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-1 min-h-0 flex-col">
          {loading && <TableSkeleton rows={5} cols={4} />}

          {!loading && (!employees || employees.length === 0) && <div className="flex flex-1 items-center justify-center"><EmptyState icon={<IdCard className="h-5 w-5" />} title="No resources yet" description="Click Sync from Salesforce to pull the bench roster before matching leads." /></div>}

          {!loading && employees && employees.length > 0 && filtered.length === 0 && <div className="flex flex-1 items-center justify-center"><EmptyState icon={<IdCard className="h-5 w-5" />} title="No resources found" description="Try adjusting your search." /></div>}

          {!loading && filtered.length > 0 && <TableContainer className="flex-1 min-h-0 overflow-y-auto">
              <Table className="table-fixed">
                <THead className="sticky top-0 z-10 bg-gray-50">
                  <TR>
                    <TH className="w-[12%]">Name</TH>
                    <TH className="w-[12%]">Role</TH>
                    <TH className="w-[32%]">Skills</TH>
                    <TH className="w-[16%]">Seniority</TH>
                    <TH className="w-[18%]">Summary</TH>
                    <TH className="w-[10%] text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {filtered.map(employee => <TR key={employee.id}>
                      <TD className="truncate font-medium text-foreground">{employee.name}</TD>
                      <TD className="truncate text-muted-foreground">{orNotAvailable(employee.role_title)}</TD>
                      <TD>
                        <div className="flex flex-wrap gap-1.5">
                          {employee.skills.map(skill => <Badge key={skill} tone="neutral">
                              {skill}
                            </Badge>)}
                        </div>
                      </TD>
                      <TD className="truncate text-muted-foreground">{orNotAvailable(employee.seniority)}</TD>
                      <TD className="truncate text-muted-foreground">{orNotAvailable(employee.summary)}</TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" title="Edit resource" aria-label="Edit resource" onClick={() => setEditing(employee)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" title="Delete resource" aria-label="Delete resource" onClick={() => setDeleting(employee)}>
                            <Trash2 className="h-3.5 w-3.5 text-danger" />
                          </Button>
                        </div>
                      </TD>
                    </TR>)}
                </TBody>
              </Table>
            </TableContainer>}
          </div>
        </Card>}

      <EmployeeEditModal employee={editing} saving={saving} onClose={() => setEditing(null)} onSave={handleSave} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Resource" footer={<>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="danger" loading={removing} onClick={handleDelete}>
              Delete
            </Button>
          </>}>
        <p className="text-sm text-foreground">
          Are you sure you want to delete <span className="font-medium">{deleting?.name}</span>? This can&apos;t be undone, and will fail if this resource is already matched or emailed against a lead.
        </p>
      </Modal>
    </div>;
}
