"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { EMPLOYEE_AVAILABILITY_OPTIONS } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
const EMPTY = {
  name: "",
  role_title: "",
  skills: "",
  experience_years: "",
  availability: "available",
  email: "",
  summary: ""
};
export function EmployeeFormModal({
  open,
  onClose,
  onSubmit,
  employee,
  saving
}) {
  const [values, setValues] = useState(EMPTY);
  useEffect(() => {
    if (!open) return;
    // Reset the form to the target employee (or blank) each time the modal opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(employee ? {
      name: employee.name,
      role_title: employee.role_title,
      skills: employee.skills.join(", "),
      experience_years: String(employee.experience_years),
      availability: employee.availability,
      email: employee.email ?? "",
      summary: employee.summary ?? ""
    } : EMPTY);
  }, [open, employee]);
  function update(key, value) {
    setValues(prev => ({
      ...prev,
      [key]: value
    }));
  }
  return <Modal open={open} onClose={onClose} title={employee ? "Edit Employee" : "Add Employee"} footer={<>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(values)} loading={saving} disabled={!values.name}>
            {employee ? "Save Changes" : "Add Employee"}
          </Button>
        </>}>
      <div className="flex flex-col gap-4">
        <Input label="Name" value={values.name} onChange={e => update("name", e.target.value)} required />
        <Input label="Role title" value={values.role_title} onChange={e => update("role_title", e.target.value)} />
        <Input label="Skills" value={values.skills} onChange={e => update("skills", e.target.value)} placeholder="e.g. Java, Spring, AWS" hint="Comma-separated" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Experience (years)" type="number" value={values.experience_years} onChange={e => update("experience_years", e.target.value)} />
          <Select label="Availability" value={values.availability} onChange={e => update("availability", e.target.value)} options={EMPLOYEE_AVAILABILITY_OPTIONS.map(v => ({
          label: titleCase(v.replace("-", "_")),
          value: v
        }))} />
        </div>
        <Input label="Email" type="email" value={values.email} onChange={e => update("email", e.target.value)} />
        <Textarea label="Summary" rows={3} value={values.summary} onChange={e => update("summary", e.target.value)} />
      </div>
    </Modal>;
}
