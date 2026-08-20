import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { ContactStatusBadge } from "@/components/jobs/ContactStatusBadge";
import { formatApplicants, formatEmployeeCount } from "@/lib/utils";
import { Briefcase } from "lucide-react";
export function RecentQualifiedJobsTable({
  jobs,
  loading
}) {
  const qualified = jobs?.filter(j => j.qualified).slice(0, 5);
  return <Card>
      <CardHeader title="Recent qualified jobs" subtitle="Latest jobs that passed your qualification rules" action={<Link href="/search" className="focus-ring rounded text-sm font-medium text-brand hover:underline">
            View all
          </Link>} />
      {loading && <TableSkeleton rows={5} cols={7} />}
      {!loading && qualified && qualified.length === 0 && <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No qualified jobs yet" description="Run a job search to start discovering qualified opportunities." />}
      {!loading && qualified && qualified.length > 0 && <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Job</TH>
                <TH>Company</TH>
                <TH>Location</TH>
                <TH>Posted</TH>
                <TH>Applicants</TH>
                <TH>Company Size</TH>
                <TH>Qualification</TH>
                <TH>Contact</TH>
              </TR>
            </THead>
            <TBody>
              {qualified.map(job => <TR key={job.id}>
                  <TD>
                    <Link href={`/jobs/${job.id}`} className="font-medium text-foreground hover:text-brand">
                      {job.job_title}
                    </Link>
                  </TD>
                  <TD className="text-muted-foreground">{job.company_name}</TD>
                  <TD className="text-muted-foreground">{job.job_location}</TD>
                  <TD className="text-muted-foreground">{job.job_posted_time}</TD>
                  <TD className="text-muted-foreground">
                    {formatApplicants(job.job_num_applicants)} applicants
                  </TD>
                  <TD className="text-muted-foreground">
                    {formatEmployeeCount(job.company_employee_count)}
                  </TD>
                  <TD>
                    <QualificationBadge qualified={job.qualified} />
                  </TD>
                  <TD>
                    <ContactStatusBadge job={job} />
                  </TD>
                </TR>)}
            </TBody>
          </Table>
        </TableContainer>}
    </Card>;
}
