import Link from "next/link";
import { Building2 } from "lucide-react";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatEmployeeCount, orNotAvailable } from "@/lib/utils";
export function CompaniesTable({
  companies
}) {
  if (companies.length === 0) {
    return <EmptyState icon={<Building2 className="h-5 w-5" />} title="No companies found" description="Try adjusting your search or filters." />;
  }
  return <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH>Company</TH>
            <TH>Domain</TH>
            <TH>Industry</TH>
            <TH>Employees</TH>
            <TH>Location</TH>
            <TH>Website</TH>
            <TH>LinkedIn</TH>
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
              <TD className="text-muted-foreground">{orNotAvailable(company.company_domain)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(company.industry)}</TD>
              <TD className="text-muted-foreground">{formatEmployeeCount(company.employee_count)}</TD>
              <TD className="text-muted-foreground">{orNotAvailable(company.location)}</TD>
              <TD>
                {company.company_website ? <a href={company.company_website} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    Visit
                  </a> : <span className="text-muted-foreground">Not available</span>}
              </TD>
              <TD>
                {company.company_linkedin_url ? <a href={company.company_linkedin_url} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    View
                  </a> : <span className="text-muted-foreground">Not available</span>}
              </TD>
              <TD className="text-muted-foreground">{company.leads_count ?? 0}</TD>
              <TD className="text-right">
                <Link href={`/companies/${company.id}`} className="focus-ring inline-flex h-8 items-center rounded-lg border border-border-strong bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-gray-50">
                  View Details
                </Link>
              </TD>
            </TR>)}
        </TBody>
      </Table>
    </TableContainer>;
}
