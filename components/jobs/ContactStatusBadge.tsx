import { Building2, UserCheck, UserSearch, UserX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Job } from "@/types/job";

export function ContactStatusBadge({ job }: { job: Job }) {
  if (job.contact?.contact_type === "job_poster") {
    return (
      <Badge tone="brand">
        <UserCheck className="h-3 w-3" />
        Job Poster Found
      </Badge>
    );
  }
  if (job.contact?.contact_type === "hr_recruiter") {
    return (
      <Badge tone="info">
        <UserSearch className="h-3 w-3" />
        HR Contact Found
      </Badge>
    );
  }
  if (job.company?.company_name) {
    return (
      <Badge tone="neutral">
        <Building2 className="h-3 w-3" />
        Company Only
      </Badge>
    );
  }
  return (
    <Badge tone="neutral">
      <UserX className="h-3 w-3" />
      Not Found
    </Badge>
  );
}
