"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CardBody, CardHeader } from "@/components/ui/Card";
import type { Campaign } from "@/types/campaign";

export function NameStep({
  campaign,
  onNext,
  loading,
}: {
  campaign: Campaign;
  onNext: (name: string) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(campaign.name);

  return (
    <>
      <CardHeader title="Campaign Name" subtitle="Edit the campaign name if needed, or keep the auto-generated one." />
      <CardBody className="max-w-md">
        <Input label="Campaign name" value={name} onChange={(e) => setName(e.target.value)} />
      </CardBody>
      <div className="flex items-center justify-end border-t border-border px-5 py-4">
        <Button onClick={() => onNext(name)} loading={loading}>
          Next
        </Button>
      </div>
    </>
  );
}
