"use client";

import { use, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { CampaignStepper } from "@/components/campaigns/CampaignStepper";
import { CampaignStageBadge } from "@/components/campaigns/CampaignStageBadge";
import { NameStep } from "@/components/campaigns/steps/NameStep";
import { JobsReviewStep } from "@/components/campaigns/steps/JobsReviewStep";
import { LeadConfirmStep } from "@/components/campaigns/steps/LeadConfirmStep";
import { MatchingStep } from "@/components/campaigns/steps/MatchingStep";
import { EmailStep } from "@/components/campaigns/steps/EmailStep";
import { CompletedSummary } from "@/components/campaigns/steps/CompletedSummary";
import { useToast } from "@/components/ui/Toast";
import { useCampaign } from "@/hooks/useCampaigns";
import { confirmCampaignName } from "@/lib/api";
const STEPS = [{
  label: "Name",
  value: 1
}, {
  label: "Jobs",
  value: 2
}, {
  label: "Leads",
  value: 3
}, {
  label: "Matching",
  value: 4
}, {
  label: "Email",
  value: 5
}];
const STAGE_STEP = {
  name: 1,
  jobs_review: 2,
  lead_confirm: 3,
  matching: 4,
  email: 5,
  completed: 5
};
export default function CampaignDetailsPage({
  params
}) {
  const {
    campaignId
  } = use(params);
  const {
    data: campaign,
    loading,
    error,
    refetch
  } = useCampaign(campaignId);
  const {
    toast
  } = useToast();
  const [savingName, setSavingName] = useState(false);
  async function handleConfirmName(name) {
    setSavingName(true);
    try {
      await confirmCampaignName(campaignId, name);
      refetch();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to save name",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setSavingName(false);
    }
  }
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (loading || !campaign) {
    return <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>;
  }
  return <div>
      <PageHeader breadcrumbs={[{
      label: "Campaigns",
      href: "/campaigns"
    }, {
      label: campaign.name
    }]} title={<span className="flex flex-wrap items-center gap-3">
            {campaign.name}
            <CampaignStageBadge stage={campaign.stage} />
          </span>} subtitle={`Role: ${campaign.role_name}`} />

      {campaign.stage !== "completed" && <Card className="mb-6 px-5 py-4">
          <CampaignStepper steps={STEPS} current={STAGE_STEP[campaign.stage]} />
        </Card>}

      <Card>
        {campaign.stage === "name" && <NameStep campaign={campaign} onNext={handleConfirmName} loading={savingName} />}
        {campaign.stage === "jobs_review" && <JobsReviewStep campaignId={campaignId} onAdvanced={refetch} />}
        {campaign.stage === "lead_confirm" && <LeadConfirmStep campaignId={campaignId} onAdvanced={refetch} />}
        {campaign.stage === "matching" && <MatchingStep campaignId={campaignId} onAdvanced={refetch} />}
        {campaign.stage === "email" && <EmailStep campaignId={campaignId} onSent={refetch} />}
        {campaign.stage === "completed" && <CompletedSummary campaign={campaign} />}
      </Card>
    </div>;
}
