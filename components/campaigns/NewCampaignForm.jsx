"use client";

import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { COUNTRY_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, EXPERIENCE_LEVEL_OPTIONS, JOB_SOURCE_OPTIONS, POSTING_TIMEFRAME_OPTIONS, WORK_MODE_OPTIONS } from "@/lib/constants";

function suggestName(jobRole) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const slug = jobRole.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return slug ? `Campaign_${today}_${slug}` : "";
}

// Values here must match the exact tokens backend/config.py's keyword maps
// expect (see lib/constants.js) — not arbitrary display strings.
export const DEFAULT_CAMPAIGN_PARAMS = {
  job_role: "",
  location: "",
  country: "",
  experience_level: "",
  employment_type: "",
  work_mode: "",
  company: "",
  posting_timeframe: "",
  // Defaults to LinkedIn — today's only active source — rather than an
  // empty/placeholder state, so a value is always present without needing
  // a separate required-field validation pattern this form doesn't use
  // elsewhere.
  job_source: "linkedin"
};

export function NewCampaignForm({
  onCreate,
  loading
}) {
  const [name, setName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [params, setParams] = useState(DEFAULT_CAMPAIGN_PARAMS);

  function update(key, value) {
    setParams(prev => {
      const next = { ...prev, [key]: value };
      if (key === "job_role" && !nameEdited) setName(suggestName(value));
      return next;
    });
  }
  function handleSubmit(e) {
    e.preventDefault();
    onCreate({ name, search_criteria: params });
  }
  function handleReset() {
    setParams(DEFAULT_CAMPAIGN_PARAMS);
    setName("");
    setNameEdited(false);
  }

  return <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Input
          label="Campaign Name"
          value={name}
          onChange={e => {
            setName(e.target.value);
            setNameEdited(true);
          }}
          placeholder="e.g. Campaign_20260820_ai-ml-engineer"
          required
          wrapperClassName="sm:col-span-2 lg:col-span-2"
        />
        <Input label="Job Role" value={params.job_role} onChange={e => update("job_role", e.target.value)} placeholder="e.g. AI/ML Engineer" required />
        <Input label="City" value={params.location} onChange={e => update("location", e.target.value)} placeholder="e.g. London" required />
        <Select label="Country" value={params.country} onChange={e => update("country", e.target.value)} options={COUNTRY_OPTIONS} placeholder="Select country" />
        <Select label="Posting Timeframe" value={params.posting_timeframe} onChange={e => update("posting_timeframe", e.target.value)} options={POSTING_TIMEFRAME_OPTIONS} placeholder="Select timeframe" />
        <Select label="Employment Type" value={params.employment_type} onChange={e => update("employment_type", e.target.value)} options={EMPLOYMENT_TYPE_OPTIONS} placeholder="Select employment type" />
        <Select label="Experience Level" value={params.experience_level} onChange={e => update("experience_level", e.target.value)} options={EXPERIENCE_LEVEL_OPTIONS.map(v => ({ label: v, value: v }))} placeholder="Select experience level" />
        <Select label="Work Mode" value={params.work_mode} onChange={e => update("work_mode", e.target.value)} options={WORK_MODE_OPTIONS} placeholder="Select work mode" />
        <Input label="Company" value={params.company} onChange={e => update("company", e.target.value)} placeholder="Optional" />
        <Select label="Job Source" value={params.job_source} onChange={e => update("job_source", e.target.value)} options={JOB_SOURCE_OPTIONS} />
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button type="submit" title="Create campaign" loading={loading} icon={<Plus className="h-4 w-4" />}>
          Create Campaign
        </Button>
        <Button type="button" variant="outline" title="Reset form" onClick={handleReset} icon={<RotateCcw className="h-4 w-4" />}>
          Reset
        </Button>
      </div>
    </form>;
}
