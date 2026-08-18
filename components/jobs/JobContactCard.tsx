import { Building2, Mail, Phone, User, UserX, Globe, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { orNotAvailable } from "@/lib/utils";
import type { Job } from "@/types/job";

function InfoRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value?: string; href?: string }) {
  const isAvailable = value && value.trim().length > 0;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isAvailable && href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand hover:underline">
            {value}
          </a>
        ) : (
          <p className={`text-sm font-medium ${isAvailable ? "text-foreground" : "text-muted-foreground"}`}>
            {orNotAvailable(value)}
          </p>
        )}
      </div>
    </div>
  );
}

export function JobContactCard({ job }: { job: Job }) {
  const contact = job.contact;

  if (contact?.contact_type === "job_poster") {
    return (
      <div>
        <Badge tone="brand" className="mb-3">
          Job Poster
        </Badge>
        <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={contact.name} />
        <InfoRow icon={<Building2 className="h-4 w-4" />} label="Job Title" value={contact.job_title} />
        <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} />
        <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={contact.phone} />
        <InfoRow icon={<Link2 className="h-4 w-4" />} label="LinkedIn" value={contact.linkedin_url} href={contact.linkedin_url} />
      </div>
    );
  }

  if (contact?.contact_type === "hr_recruiter") {
    return (
      <div>
        <p className="mb-3 text-sm text-muted-foreground">Job poster unavailable</p>
        <Badge tone="info" className="mb-3">
          HR Contact
        </Badge>
        <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={contact.name} />
        <InfoRow icon={<Building2 className="h-4 w-4" />} label="Job Title" value={contact.job_title} />
        <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} />
        <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={contact.phone} />
        <InfoRow icon={<Link2 className="h-4 w-4" />} label="LinkedIn" value={contact.linkedin_url} href={contact.linkedin_url} />
      </div>
    );
  }

  if (job.company) {
    return (
      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          No individual contact found — showing company information.
        </p>
        <Badge tone="neutral" className="mb-3">
          Company
        </Badge>
        <InfoRow icon={<Building2 className="h-4 w-4" />} label="Company" value={job.company.company_name} />
        <InfoRow icon={<Globe className="h-4 w-4" />} label="Website" value={job.company.company_website} href={job.company.company_website} />
        <InfoRow icon={<Link2 className="h-4 w-4" />} label="LinkedIn" value={job.company.company_linkedin_url} href={job.company.company_linkedin_url} />
        <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={job.company.company_phone} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <UserX className="mb-2 h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">No contact found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Neither a job poster, HR contact, nor company details could be identified.
      </p>
    </div>
  );
}
