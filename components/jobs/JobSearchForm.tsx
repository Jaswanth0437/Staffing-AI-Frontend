"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  COUNTRY_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  JOB_TYPE_OPTIONS,
  REMOTE_OPTIONS,
  TIME_RANGE_OPTIONS,
} from "@/lib/constants";
import type { JobSearchParams } from "@/types/job";

export const DEFAULT_SEARCH_PARAMS: JobSearchParams = {
  keyword: "AI/ML Engineer",
  location: "London",
  country: "GB",
  time_range: "Past 24 hours",
  job_type: "Full-time",
  experience_level: "Mid-Senior level",
  remote: "On-site",
  company: "",
  location_radius: "25",
  max_applicants: 99,
  min_company_size: 50,
  max_company_size: 10000,
};

export function JobSearchForm({
  onSearch,
  loading,
}: {
  onSearch: (params: JobSearchParams) => void;
  loading: boolean;
}) {
  const [params, setParams] = useState<JobSearchParams>(DEFAULT_SEARCH_PARAMS);

  function update<K extends keyof JobSearchParams>(key: K, value: JobSearchParams[K]) {
    setParams((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch(params);
  }

  function handleReset() {
    setParams(DEFAULT_SEARCH_PARAMS);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Input
          label="Keyword"
          value={params.keyword}
          onChange={(e) => update("keyword", e.target.value)}
          placeholder="e.g. AI/ML Engineer"
        />
        <Input
          label="Location"
          value={params.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="e.g. London"
        />
        <Select
          label="Country"
          value={params.country}
          onChange={(e) => update("country", e.target.value)}
          options={COUNTRY_OPTIONS}
        />
        <Select
          label="Time Range"
          value={params.time_range}
          onChange={(e) => update("time_range", e.target.value)}
          options={TIME_RANGE_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
        <Select
          label="Job Type"
          value={params.job_type}
          onChange={(e) => update("job_type", e.target.value)}
          options={JOB_TYPE_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
        <Select
          label="Experience Level"
          value={params.experience_level}
          onChange={(e) => update("experience_level", e.target.value)}
          options={EXPERIENCE_LEVEL_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
        <Select
          label="Remote"
          value={params.remote}
          onChange={(e) => update("remote", e.target.value)}
          options={REMOTE_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
        <Input
          label="Company"
          value={params.company}
          onChange={(e) => update("company", e.target.value)}
          placeholder="Optional"
        />
        <Input
          label="Location Radius (mi)"
          type="number"
          value={params.location_radius}
          onChange={(e) => update("location_radius", e.target.value)}
        />
        <Input
          label="Maximum Applicants"
          type="number"
          value={params.max_applicants}
          onChange={(e) => update("max_applicants", Number(e.target.value))}
        />
        <Input
          label="Minimum Company Size"
          type="number"
          value={params.min_company_size}
          onChange={(e) => update("min_company_size", Number(e.target.value))}
        />
        <Input
          label="Maximum Company Size"
          type="number"
          value={params.max_company_size}
          onChange={(e) => update("max_company_size", Number(e.target.value))}
        />
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button type="submit" loading={loading} icon={<Search className="h-4 w-4" />}>
          Search Jobs
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} icon={<RotateCcw className="h-4 w-4" />}>
          Reset
        </Button>
      </div>
    </form>
  );
}
