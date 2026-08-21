import { Badge } from "@/components/ui/Badge";
import { titleCase } from "@/lib/utils";
const TONE = {
  // Real backend lead.status enum:
  new: "info",
  contacted: "violet",
  replied: "success",
  closed: "neutral",
  // Legacy mock lead.status enum (manual /leads/new flow):
  qualified: "success",
  converted: "success",
  rejected: "danger"
};
export function LeadStatusBadge({
  status
}) {
  return <Badge tone={TONE[status]} dot>
      {titleCase(status)}
    </Badge>;
}
