import { Badge } from "@/components/ui/Badge";
import type { LeadStatus } from "@/types/lead";
import { titleCase } from "@/lib/utils";

const TONE: Record<LeadStatus, "neutral" | "info" | "success" | "brand" | "danger"> = {
  new: "info",
  contacted: "brand",
  qualified: "success",
  converted: "success",
  rejected: "danger",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge tone={TONE[status]} dot>
      {titleCase(status)}
    </Badge>
  );
}
