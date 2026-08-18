import { Badge } from "@/components/ui/Badge";
import type { CampaignStatus } from "@/types/campaign";
import { titleCase } from "@/lib/utils";

const TONE: Record<CampaignStatus, "neutral" | "success" | "warning" | "brand"> = {
  draft: "neutral",
  active: "success",
  paused: "warning",
  completed: "brand",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge tone={TONE[status]} dot>
      {titleCase(status)}
    </Badge>
  );
}
