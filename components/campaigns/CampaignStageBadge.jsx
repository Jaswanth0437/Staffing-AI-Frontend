import { Badge } from "@/components/ui/Badge";
import { CAMPAIGN_STAGE_LABELS } from "@/lib/constants";
const TONE = {
  name: "neutral",
  jobs_review: "info",
  lead_confirm: "info",
  matching: "violet",
  email: "warning",
  completed: "success"
};
export function CampaignStageBadge({
  stage
}) {
  return <Badge tone={TONE[stage]} dot>
      {CAMPAIGN_STAGE_LABELS[stage]}
    </Badge>;
}
