import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
export function QualificationBadge({
  qualified
}) {
  // Rejected gets a solid-fill treatment instead of the standard soft
  // danger badge used for less severe things elsewhere (e.g. a failed
  // email send) — this is the one status that should be unmistakable at a
  // glance in a long list of otherwise-neutral rows.
  return qualified ? <Badge tone="success">
      <CheckCircle2 className="h-3 w-3" />
      Qualified
    </Badge> : <Badge tone="danger" className="border-transparent bg-danger text-white">
      <XCircle className="h-3 w-3" />
      Rejected
    </Badge>;
}
