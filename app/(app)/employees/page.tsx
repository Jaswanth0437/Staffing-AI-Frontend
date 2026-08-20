"use client";

import { useState } from "react";
import { IdCard, Pencil, Plus, Trash2 } from "lucide-react";
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
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { useEmployees } from "@/hooks/useEmployees";
import { createEmployee, deleteEmployee, updateEmployee } from "@/lib/api";
import { orNotAvailable, titleCase } from "@/lib/utils";
import type { Employee, EmployeeFormValues } from "@/types/employee";

const AVAILABILITY_TONE: Record<Employee["availability"], "success" | "warning" | "neutral"> = {
  available: "success",
  "on-bench": "warning",
  deployed: "neutral",
};

export default function EmployeesPage() {
  const { data: employees, loading, error, refetch } = useEmployees();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(employee: Employee) {
    setEditing(employee);
    setFormOpen(true);
  }

  async function handleSubmit(values: EmployeeFormValues) {
    setSaving(true);
    try {
      if (editing) {
        await updateEmployee(editing.id, values);
        toast({ tone: "success", title: "Employee updated" });
      } else {
        await createEmployee(values);
        toast({ tone: "success", title: "Employee added" });
      }
      setFormOpen(false);
      refetch();
    } catch (err) {
      toast({ tone: "error", title: "Failed to save employee", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteEmployee(deleteTarget.id);
      toast({ tone: "success", title: "Employee removed" });
      refetch();
    } catch (err) {
      toast({ tone: "error", title: "Failed to remove employee", description: err instanceof Error ? err.message : undefined });
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Your bench of employees, matched against lead job requirements in the campaign flow."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Add Employee
          </Button>
        }
      />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && (
        <Card>
          {loading && <TableSkeleton rows={5} cols={6} />}

          {!loading && (!employees || employees.length === 0) && (
            <EmptyState
              icon={<IdCard className="h-5 w-5" />}
              title="No employees yet"
              description="Add your bench of employees so they can be matched against lead job requirements."
            />
          )}

          {!loading && employees && employees.length > 0 && (
            <TableContainer>
              <Table>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH>Role</TH>
                    <TH>Skills</TH>
                    <TH>Experience</TH>
                    <TH>Availability</TH>
                    <TH>Email</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {employees.map((employee) => (
                    <TR key={employee.id}>
                      <TD className="font-medium text-foreground">{employee.name}</TD>
                      <TD className="text-muted-foreground">{orNotAvailable(employee.role_title)}</TD>
                      <TD>
                        <div className="flex flex-wrap gap-1.5">
                          {employee.skills.map((skill) => (
                            <Badge key={skill} tone="neutral">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </TD>
                      <TD className="text-muted-foreground">{employee.experience_years} yrs</TD>
                      <TD>
                        <Badge tone={AVAILABILITY_TONE[employee.availability]} dot>
                          {titleCase(employee.availability.replace("-", "_"))}
                        </Badge>
                      </TD>
                      <TD className="text-muted-foreground">{orNotAvailable(employee.email)}</TD>
                      <TD className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" aria-label="Edit employee" onClick={() => openEdit(employee)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" aria-label="Delete employee" onClick={() => setDeleteTarget(employee)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      <EmployeeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        employee={editing}
        saving={saving}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove employee"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to remove {deleteTarget?.name} from your bench? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
