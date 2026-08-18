import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function QualificationBadge({ qualified }: { qualified: boolean }) {
  return qualified ? (
    <Badge tone="success">
      <CheckCircle2 className="h-3 w-3" />
      Qualified
    </Badge>
  ) : (
    <Badge tone="danger">
      <XCircle className="h-3 w-3" />
      Rejected
    </Badge>
  );
}
