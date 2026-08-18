"use client";

import { Select } from "@/components/ui/Select";

export interface JobFilterValues {
  qualification: string;
  companySize: string;
  applicants: string;
  location: string;
  posted: string;
}

export const DEFAULT_JOB_FILTERS: JobFilterValues = {
  qualification: "all",
  companySize: "all",
  applicants: "all",
  location: "all",
  posted: "all",
};

export function JobFilters({
  values,
  onChange,
  locations,
}: {
  values: JobFilterValues;
  onChange: (values: JobFilterValues) => void;
  locations: string[];
}) {
  function update<K extends keyof JobFilterValues>(key: K, value: JobFilterValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        aria-label="Filter by qualification"
        value={values.qualification}
        onChange={(e) => update("qualification", e.target.value)}
        options={[
          { label: "All qualification", value: "all" },
          { label: "Qualified", value: "qualified" },
          { label: "Rejected", value: "rejected" },
        ]}
        className="w-auto min-w-[9rem]"
      />
      <Select
        aria-label="Filter by company size"
        value={values.companySize}
        onChange={(e) => update("companySize", e.target.value)}
        options={[
          { label: "Any company size", value: "all" },
          { label: "Under 50 employees", value: "under_50" },
          { label: "50 – 10,000 employees", value: "in_range" },
          { label: "Over 10,000 employees", value: "over_10000" },
        ]}
        className="w-auto min-w-[10rem]"
      />
      <Select
        aria-label="Filter by applicants"
        value={values.applicants}
        onChange={(e) => update("applicants", e.target.value)}
        options={[
          { label: "Any applicants", value: "all" },
          { label: "Under 25", value: "under_25" },
          { label: "25 – 99", value: "25_99" },
          { label: "100+", value: "100_plus" },
        ]}
        className="w-auto min-w-[9rem]"
      />
      <Select
        aria-label="Filter by location"
        value={values.location}
        onChange={(e) => update("location", e.target.value)}
        options={[{ label: "All locations", value: "all" }, ...locations.map((l) => ({ label: l, value: l }))]}
        className="w-auto min-w-[10rem]"
      />
      <Select
        aria-label="Filter by posted date"
        value={values.posted}
        onChange={(e) => update("posted", e.target.value)}
        options={[
          { label: "Any time", value: "all" },
          { label: "Past 24 hours", value: "24h" },
          { label: "Past week", value: "week" },
        ]}
        className="w-auto min-w-[9rem]"
      />
    </div>
  );
}
