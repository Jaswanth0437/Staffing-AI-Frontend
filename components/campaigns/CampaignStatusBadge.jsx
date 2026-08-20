import { Badge } from "@/components/ui/Badge";
import { titleCase } from "@/lib/utils";
const TONE = {
  active: "warning",
  completed: "success"
};
export function CampaignStatusBadge({
  status
}) {
  return <Badge tone={TONE[status]} dot>
      {titleCase(status)}
    </Badge>;
}
