import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { formatApplicants, formatDate, formatEmployeeCount } from "@/lib/utils";
import { Briefcase } from "lucide-react";
export function RecentQualifiedJobsTable({
  jobs,
  loading
}) {
  const qualified = jobs?.filter(j => j.qualified).slice(0, 5);
  return <Card>
      <CardHeader title="Recent Qualified Jobs" subtitle="Latest Jobs That Passed Your Qualification Rules" action={<Link href="/campaigns" className="focus-ring rounded text-sm font-medium text-brand hover:underline">
            View All
          </Link>} />
      {loading && <TableSkeleton rows={5} cols={7} />}
      {!loading && qualified && qualified.length === 0 && <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No Qualified Jobs Yet" description="Run A Campaign To Start Discovering Qualified Opportunities." />}
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
                <TH>Lead</TH>
              </TR>
            </THead>
            <TBody>
              {qualified.map(job => <TR key={job.id}>
                  <TD>
                    <Link href={`/campaigns/${job.campaign_id}/jobs/${job.id}`} className="font-medium text-foreground hover:text-brand">
                      {job.job_title}
                    </Link>
                  </TD>
                  <TD className="text-muted-foreground">{job.company_name}</TD>
                  <TD className="text-muted-foreground">{job.job_location}</TD>
                  <TD className="text-muted-foreground">{job.posted_date ? formatDate(job.posted_date) : "—"}</TD>
                  <TD className="text-muted-foreground">
                    {formatApplicants(job.job_num_applicants)} applicants
                  </TD>
                  <TD className="text-muted-foreground">
                    {formatEmployeeCount(job.company_employee_count)}
                  </TD>
                  <TD>
                    {job.lead_id ? <Badge tone="success">Lead Created</Badge> : <Badge tone="neutral">Not Created</Badge>}
                  </TD>
                </TR>)}
            </TBody>
          </Table>
        </TableContainer>}
    </Card>;
}
