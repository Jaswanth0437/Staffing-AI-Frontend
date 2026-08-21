"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewCampaignForm } from "@/components/campaigns/NewCampaignForm";
import { useToast } from "@/components/ui/Toast";
import { createCampaign } from "@/lib/api";
export default function NewCampaignPage() {
  const router = useRouter();
  const {
    toast
  } = useToast();
  const [creating, setCreating] = useState(false);
  async function handleCreate(payload) {
    setCreating(true);
    try {
      const campaign = await createCampaign(payload);
      toast({
        tone: "success",
        title: "Campaign created",
        description: `${campaign.name} is now discovering jobs from Apify in the background.`
      });
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to create campaign",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setCreating(false);
    }
  }
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Campaigns",
      href: "/campaigns"
    }, {
      label: "New Campaign"
    }]} title="New Campaign" subtitle="Set your search criteria — this pulls the initial job list from Apify and creates the campaign." />

      <NewCampaignForm onCreate={handleCreate} loading={creating} />
    </div>;
}
