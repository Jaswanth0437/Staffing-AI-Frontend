import Link from "next/link";
import { Building2 } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatEmployeeCount, orNotAvailable } from "@/lib/utils";
export function CompaniesTable({
  companies
}) {
  if (companies.length === 0) {
    return <EmptyState icon={<Building2 className="h-5 w-5" />} title="No companies found" description="Companies appear here once jobs are discovered for them." />;
  }
  return <TableContainer className="max-h-[20rem] overflow-y-auto">
      <Table>
        <THead className="sticky top-0 z-10 bg-gray-50">
          <TR>
            <TH>Company</TH>
            <TH>Location</TH>
            <TH>Employees</TH>
            <TH>Jobs</TH>
            <TH>Qualified</TH>
            <TH>Leads</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {companies.map(company => <TR key={company.id}>
              <TD>
                <Link href={`/companies/${company.id}`} className="font-medium text-foreground hover:text-brand">
                  {company.company_name}
                </Link>
              </TD>
              <TD className="text-muted-foreground">{orNotAvailable(company.location)}</TD>
              <TD className="text-muted-foreground">{formatEmployeeCount(company.employee_count)}</TD>
              <TD className="text-muted-foreground">{company.job_count}</TD>
              <TD>
                <Badge tone={company.qualified_count > 0 ? "success" : "neutral"}>{company.qualified_count}</Badge>
              </TD>
              <TD className="text-muted-foreground">{company.lead_count}</TD>
              <TD className="text-right">
                <Link href={`/companies/${company.id}`} title="View company details" className="focus-ring inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                  View Details
                </Link>
              </TD>
            </TR>)}
        </TBody>
      </Table>
    </TableContainer>;
}
