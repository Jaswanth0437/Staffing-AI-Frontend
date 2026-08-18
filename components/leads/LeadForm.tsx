"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS, LEAD_TYPE_OPTIONS } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
import { validateLeadForm, isFormValid } from "@/lib/validations";
import type { LeadFormValues } from "@/types/lead";

export const EMPTY_LEAD_FORM: LeadFormValues = {
  first_name: "",
  last_name: "",
  job_title: "",
  email: "",
  phone: "",
  linkedin_url: "",
  company_name: "",
  company_website: "",
  company_linkedin_url: "",
  company_domain: "",
  employee_count: "",
  lead_type: "job_poster",
  source: "Manual",
  status: "new",
  notes: "",
};

export function LeadForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  submitting,
}: {
  initialValues?: LeadFormValues;
  onSubmit: (values: LeadFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  submitting?: boolean;
}) {
  const [values, setValues] = useState<LeadFormValues>(initialValues ?? EMPTY_LEAD_FORM);
  const [errors, setErrors] = useState<ReturnType<typeof validateLeadForm>>({});

  function update<K extends keyof LeadFormValues>(key: K, value: LeadFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateLeadForm(values);
    setErrors(validationErrors);
    if (isFormValid(validationErrors)) {
      onSubmit(values);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Contact Information" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First Name" value={values.first_name} onChange={(e) => update("first_name", e.target.value)} error={errors.first_name} required />
          <Input label="Last Name" value={values.last_name} onChange={(e) => update("last_name", e.target.value)} error={errors.last_name} required />
          <Input label="Job Title" value={values.job_title} onChange={(e) => update("job_title", e.target.value)} error={errors.job_title} />
          <Input label="Email" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
          <Input label="Phone" value={values.phone} onChange={(e) => update("phone", e.target.value)} error={errors.phone} />
          <Input label="LinkedIn URL" value={values.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} error={errors.linkedin_url} placeholder="https://linkedin.com/in/..." />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Company Information" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Company" value={values.company_name} onChange={(e) => update("company_name", e.target.value)} error={errors.company_name} required />
          <Input label="Website" value={values.company_website} onChange={(e) => update("company_website", e.target.value)} error={errors.company_website} placeholder="https://" />
          <Input label="LinkedIn" value={values.company_linkedin_url} onChange={(e) => update("company_linkedin_url", e.target.value)} error={errors.company_linkedin_url} placeholder="https://linkedin.com/company/..." />
          <Input label="Domain" value={values.company_domain} onChange={(e) => update("company_domain", e.target.value)} error={errors.company_domain} placeholder="company.com" />
          <Input label="Employee Size" type="number" value={values.employee_count} onChange={(e) => update("employee_count", e.target.value)} error={errors.employee_count} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Lead Information" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Lead Type"
            value={values.lead_type}
            onChange={(e) => update("lead_type", e.target.value as LeadFormValues["lead_type"])}
            options={LEAD_TYPE_OPTIONS.map((v) => ({ label: titleCase(v), value: v }))}
          />
          <Select
            label="Source"
            value={values.source}
            onChange={(e) => update("source", e.target.value)}
            options={LEAD_SOURCE_OPTIONS.map((v) => ({ label: v, value: v }))}
          />
          <Select
            label="Status"
            value={values.status}
            onChange={(e) => update("status", e.target.value as LeadFormValues["status"])}
            options={LEAD_STATUS_OPTIONS.map((v) => ({ label: titleCase(v), value: v }))}
          />
          <Textarea
            label="Notes"
            value={values.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            wrapperClassName="sm:col-span-2"
          />
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
