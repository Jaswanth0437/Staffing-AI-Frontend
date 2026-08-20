import { Badge } from "@/components/ui/Badge";
import { CAMPAIGN_STAGE_LABELS, type CampaignStage } from "@/types/campaign";

const TONE: Record<CampaignStage, "neutral" | "info" | "violet" | "warning" | "success"> = {
  name: "neutral",
  jobs_review: "info",
  lead_confirm: "info",
  matching: "violet",
  email: "warning",
  completed: "success",
};

export function CampaignStageBadge({ stage }: { stage: CampaignStage }) {
  return (
    <Badge tone={TONE[stage]} dot>
      {CAMPAIGN_STAGE_LABELS[stage]}
    </Badge>
  );
}
