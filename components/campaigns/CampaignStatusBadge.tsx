import { Badge } from "@/components/ui/Badge";
import type { CampaignStatus } from "@/types/campaign";
import { titleCase } from "@/lib/utils";

const TONE: Record<CampaignStatus, "neutral" | "success" | "warning" | "brand"> = {
  active: "warning",
  completed: "success",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge tone={TONE[status]} dot>
      {titleCase(status)}
    </Badge>
  );
}
