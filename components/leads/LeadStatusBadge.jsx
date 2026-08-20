import { Badge } from "@/components/ui/Badge";
import { titleCase } from "@/lib/utils";
const TONE = {
  new: "info",
  contacted: "violet",
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
