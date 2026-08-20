"use client";

import { useState } from "react";
import { IdCard, Pencil, RefreshCw, Trash2 } from "lucide-react";
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
      toast({ tone: "success", title: "Employee updated" });
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
      toast({ tone: "success", title: "Employee deleted" });
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

  return <div>
      <PageHeader title="Employees" subtitle="Your bench, synced from Salesforce — matched against lead job requirements in the campaign flow." actions={<Button icon={<RefreshCw className="h-4 w-4" />} loading={syncing} onClick={handleSync}>
            Sync from Salesforce
          </Button>} />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card>
          {loading && <TableSkeleton rows={5} cols={4} />}

          {!loading && (!employees || employees.length === 0) && <EmptyState icon={<IdCard className="h-5 w-5" />} title="No employees yet" description="Click Sync from Salesforce to pull the bench roster before matching leads." />}

          {!loading && employees && employees.length > 0 && <TableContainer>
              <Table>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH>Role</TH>
                    <TH>Skills</TH>
                    <TH>Seniority</TH>
                    <TH>Summary</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {employees.map(employee => <TR key={employee.id}>
                      <TD className="font-medium text-foreground">{employee.name}</TD>
                      <TD className="text-muted-foreground">{orNotAvailable(employee.role_title)}</TD>
                      <TD>
                        <div className="flex flex-wrap gap-1.5">
                          {employee.skills.map(skill => <Badge key={skill} tone="neutral">
                              {skill}
                            </Badge>)}
                        </div>
                      </TD>
                      <TD className="text-muted-foreground">{orNotAvailable(employee.seniority)}</TD>
                      <TD className="max-w-sm truncate text-muted-foreground">{orNotAvailable(employee.summary)}</TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" aria-label="Edit employee" onClick={() => setEditing(employee)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" aria-label="Delete employee" onClick={() => setDeleting(employee)}>
                            <Trash2 className="h-3.5 w-3.5 text-danger" />
                          </Button>
                        </div>
                      </TD>
                    </TR>)}
                </TBody>
              </Table>
            </TableContainer>}
        </Card>}

      <EmployeeEditModal employee={editing} saving={saving} onClose={() => setEditing(null)} onSave={handleSave} />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Employee" footer={<>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="danger" loading={removing} onClick={handleDelete}>
              Delete
            </Button>
          </>}>
        <p className="text-sm text-foreground">
          Are you sure you want to delete <span className="font-medium">{deleting?.name}</span>? This can&apos;t be undone, and will fail if this employee is already matched or emailed against a lead.
        </p>
      </Modal>
    </div>;
}
