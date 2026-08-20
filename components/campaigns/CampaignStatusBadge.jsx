import { Badge } from "@/components/ui/Badge";
import { titleCase } from "@/lib/utils";
const TONE = {
  pending: "neutral",
  running: "warning",
  completed: "success",
  failed: "danger"
};
export function CampaignStatusBadge({
  status
}) {
  return <Badge tone={TONE[status]} dot>
      {titleCase(status)}
    </Badge>;
}
