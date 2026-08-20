"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { getScrapingSettings, updateScrapingSettings } from "@/lib/api";
import { COUNTRY_OPTIONS, EXPERIENCE_LEVEL_OPTIONS, JOB_TYPE_OPTIONS, REMOTE_OPTIONS, TIME_RANGE_OPTIONS } from "@/lib/constants";
export default function ScrapingSettingsPage() {
  const {
    toast
  } = useToast();
  const [values, setValues] = useState(undefined);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    getScrapingSettings().then(setValues);
  }, []);
  function update(key, value) {
    setValues(prev => prev ? {
      ...prev,
      [key]: value
    } : prev);
  }
  async function handleSave() {
    if (!values) return;
    setSaving(true);
    try {
      await updateScrapingSettings(values);
      toast({
        tone: "success",
        title: "Scraping settings saved"
      });
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to save settings",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setSaving(false);
    }
  }
  if (!values) {
    return <Card>
        <CardBody>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="mt-4 h-9 w-full" />
        </CardBody>
      </Card>;
  }
  return <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Job Discovery Defaults" subtitle="Pre-fill the job search form with these values." />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Keyword" value={values.keyword} onChange={e => update("keyword", e.target.value)} />
          <Input label="Location" value={values.location} onChange={e => update("location", e.target.value)} />
          <Select label="Country" value={values.country} onChange={e => update("country", e.target.value)} options={COUNTRY_OPTIONS} />
          <Select label="Time Range" value={values.time_range} onChange={e => update("time_range", e.target.value)} options={TIME_RANGE_OPTIONS.map(v => ({
          label: v,
          value: v
        }))} />
          <Select label="Job Type" value={values.job_type} onChange={e => update("job_type", e.target.value)} options={JOB_TYPE_OPTIONS.map(v => ({
          label: v,
          value: v
        }))} />
          <Select label="Experience Level" value={values.experience_level} onChange={e => update("experience_level", e.target.value)} options={EXPERIENCE_LEVEL_OPTIONS.map(v => ({
          label: v,
          value: v
        }))} />
          <Select label="Remote" value={values.remote} onChange={e => update("remote", e.target.value)} options={REMOTE_OPTIONS.map(v => ({
          label: v,
          value: v
        }))} />
          <Input label="Company" value={values.company} onChange={e => update("company", e.target.value)} placeholder="Optional" />
          <Input label="Location Radius (mi)" value={values.location_radius} onChange={e => update("location_radius", e.target.value)} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Qualification Rules" subtitle="Jobs outside these thresholds are automatically rejected." />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Minimum employees" type="number" value={values.min_company_employees} onChange={e => update("min_company_employees", Number(e.target.value))} />
          <Input label="Maximum employees" type="number" value={values.max_company_employees} onChange={e => update("max_company_employees", Number(e.target.value))} />
          <Input label="Maximum applicants" type="number" value={values.max_applicants} onChange={e => update("max_applicants", Number(e.target.value))} />
        </CardBody>
        <div className="flex justify-end border-t border-border px-5 py-4">
          <Button onClick={handleSave} loading={saving}>
            Save Settings
          </Button>
        </div>
      </Card>
    </div>;
}
