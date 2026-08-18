import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { QualificationBadge } from "./QualificationBadge";
import { ContactStatusBadge } from "./ContactStatusBadge";
import { formatApplicants, formatEmployeeCount } from "@/lib/utils";
import type { Job } from "@/types/job";

export function JobResultsTable({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Briefcase className="h-5 w-5" />}
        title="No jobs found"
        description="Try changing your search filters."
      />
    );
  }

  return (
    <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH>Job Title</TH>
            <TH>Company</TH>
            <TH>Location</TH>
            <TH>Posted</TH>
            <TH>Applicants</TH>
            <TH>Company Size</TH>
            <TH>Qualification</TH>
            <TH>Reason</TH>
            <TH>Contact</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {jobs.map((job) => (
            <TR key={job.id}>
              <TD>
                <Link href={`/jobs/${job.id}`} className="font-medium text-foreground hover:text-brand">
                  {job.job_title}
                </Link>
              </TD>
              <TD className="text-muted-foreground">{job.company_name}</TD>
              <TD className="text-muted-foreground">{job.job_location}</TD>
              <TD className="text-muted-foreground">{job.job_posted_time}</TD>
              <TD className="text-muted-foreground">{formatApplicants(job.job_num_applicants)}</TD>
              <TD className="text-muted-foreground">{formatEmployeeCount(job.company_employee_count)}</TD>
              <TD>
                <QualificationBadge qualified={job.qualified} />
              </TD>
              <TD className="max-w-[220px] text-muted-foreground">
                <span className="line-clamp-2">
                  {job.qualified
                    ? job.qualification_reason ?? "All configured filters passed."
                    : job.rejection_reasons?.[0] ?? job.qualification_reason}
                </span>
              </TD>
              <TD>
                <ContactStatusBadge job={job} />
              </TD>
              <TD className="text-right">
                <Link
                  href={`/jobs/${job.id}`}
                  className="focus-ring inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50"
                >
                  View Details
                </Link>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
}
