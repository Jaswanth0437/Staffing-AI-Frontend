"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

function EmployeeEditForm({ employee, onSave }) {
  const [name, setName] = useState(employee.name ?? "");
  const [role, setRole] = useState(employee.role_title ?? "");
  const [skills, setSkills] = useState((employee.skills ?? []).join(", "));
  const [seniority, setSeniority] = useState(employee.seniority ?? "");
  const [summary, setSummary] = useState(employee.summary ?? "");

  function handleSubmit(e) {
    e.preventDefault();
    onSave(employee.id, {
      name,
      role,
      skills: skills.split(",").map(s => s.trim()).filter(Boolean),
      seniority,
      experience_summary: summary
    });
  }

  return <form id="employee-edit-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Name" value={name} onChange={e => setName(e.target.value)} required />
      <Input label="Role" value={role} onChange={e => setRole(e.target.value)} />
      <Input label="Skills" value={skills} onChange={e => setSkills(e.target.value)} hint="Comma-separated" />
      <Input label="Seniority" value={seniority} onChange={e => setSeniority(e.target.value)} />
      <Textarea label="Experience Summary" value={summary} onChange={e => setSummary(e.target.value)} rows={3} />
    </form>;
}

export function EmployeeEditModal({ employee, onClose, onSave, saving }) {
  return <Modal open={!!employee} onClose={onClose} title="Edit Resource" footer={<>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" form="employee-edit-form" loading={saving}>
          Save Changes
        </Button>
      </>}>
      {employee && <EmployeeEditForm key={employee.id} employee={employee} onSave={onSave} />}
    </Modal>;
}
