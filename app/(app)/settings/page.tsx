"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { getGeneralSettings, updateGeneralSettings } from "@/lib/api";
import { COUNTRY_OPTIONS, TIME_RANGE_OPTIONS } from "@/lib/constants";
import type { GeneralSettings } from "@/types/settings";

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [values, setValues] = useState<GeneralSettings | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGeneralSettings().then((data) => {
      setValues(data);
      setLoading(false);
    });
  }, []);

  function update<K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!values) return;
    setSaving(true);
    try {
      await updateGeneralSettings(values);
      toast({ tone: "success", title: "Settings saved" });
    } catch (err) {
      toast({ tone: "error", title: "Failed to save settings", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !values) {
    return (
      <Card>
        <CardBody>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="mt-4 h-9 w-full" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="General" subtitle="Basic application preferences." />
      <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Application name"
          value={values.application_name}
          onChange={(e) => update("application_name", e.target.value)}
        />
        <Input
          label="Default location"
          value={values.default_location}
          onChange={(e) => update("default_location", e.target.value)}
        />
        <Select
          label="Default country"
          value={values.default_country}
          onChange={(e) => update("default_country", e.target.value)}
          options={COUNTRY_OPTIONS}
        />
        <Select
          label="Default time range"
          value={values.default_time_range}
          onChange={(e) => update("default_time_range", e.target.value)}
          options={TIME_RANGE_OPTIONS.map((v) => ({ label: v, value: v }))}
        />
      </CardBody>
      <div className="flex justify-end border-t border-border px-5 py-4">
        <Button onClick={handleSave} loading={saving}>
          Save Settings
        </Button>
      </div>
    </Card>
  );
}
