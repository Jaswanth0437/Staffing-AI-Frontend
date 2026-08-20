"use client";

import { Select } from "@/components/ui/Select";
import { LEAD_SOURCE_OPTIONS, LEAD_TYPE_OPTIONS } from "@/lib/constants";
import { titleCase } from "@/lib/utils";
export const DEFAULT_LEAD_FILTERS = {
  leadType: "all",
  company: "all",
  location: "all",
  source: "all"
};
export function LeadFiltersBar({
  values,
  onChange,
  companies,
  locations
}) {
  function update(key, value) {
    onChange({
      ...values,
      [key]: value
    });
  }
  return <div className="flex flex-wrap items-center gap-3">
      <Select aria-label="Filter by lead type" value={values.leadType} onChange={e => update("leadType", e.target.value)} options={[{
      label: "All lead types",
      value: "all"
    }, ...LEAD_TYPE_OPTIONS.map(v => ({
      label: titleCase(v),
      value: v
    }))]} className="w-auto min-w-[9rem]" />
      <Select aria-label="Filter by company" value={values.company} onChange={e => update("company", e.target.value)} options={[{
      label: "All companies",
      value: "all"
    }, ...companies.map(c => ({
      label: c,
      value: c
    }))]} className="w-auto min-w-[9rem]" />
      <Select aria-label="Filter by location" value={values.location} onChange={e => update("location", e.target.value)} options={[{
      label: "All locations",
      value: "all"
    }, ...locations.map(l => ({
      label: l,
      value: l
    }))]} className="w-auto min-w-[9rem]" />
      <Select aria-label="Filter by source" value={values.source} onChange={e => update("source", e.target.value)} options={[{
      label: "All sources",
      value: "all"
    }, ...LEAD_SOURCE_OPTIONS.map(v => ({
      label: v,
      value: v
    }))]} className="w-auto min-w-[9rem]" />
    </div>;
}
