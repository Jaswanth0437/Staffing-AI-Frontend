"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { CompaniesTable } from "@/components/companies/CompaniesTable";
import { useCompanies } from "@/hooks/useCompanies";
const PAGE_SIZE = 8;
export default function CompaniesPage() {
  const {
    data: companies,
    loading,
    error,
    refetch
  } = useCompanies();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [size, setSize] = useState("all");
  const [location, setLocation] = useState("all");
  const [page, setPage] = useState(1);
  const industries = useMemo(() => Array.from(new Set((companies ?? []).map(c => c.industry).filter(Boolean))), [companies]);
  const locations = useMemo(() => Array.from(new Set((companies ?? []).map(c => c.location).filter(Boolean))), [companies]);
  const filtered = useMemo(() => {
    if (!companies) return [];
    return companies.filter(c => {
      if (search && !c.company_name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (industry !== "all" && c.industry !== industry) return false;
      if (location !== "all" && c.location !== location) return false;
      const count = c.employee_count ?? 0;
      if (size === "small" && count >= 50) return false;
      if (size === "mid" && (count < 50 || count > 10000)) return false;
      if (size === "large" && count <= 10000) return false;
      return true;
    });
  }, [companies, search, industry, size, location]);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <div>
      <PageHeader title="Companies" subtitle="Companies discovered through job qualification and enrichment." />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card>
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={search} onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }} placeholder="Search companies..." aria-label="Search companies" className="focus-ring h-9 w-full rounded-lg border border-border-strong bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select aria-label="Filter by industry" value={industry} onChange={e => {
            setIndustry(e.target.value);
            setPage(1);
          }} options={[{
            label: "All industries",
            value: "all"
          }, ...industries.map(i => ({
            label: i,
            value: i
          }))]} className="w-auto min-w-[10rem]" />
              <Select aria-label="Filter by employee size" value={size} onChange={e => {
            setSize(e.target.value);
            setPage(1);
          }} options={[{
            label: "Any employee size",
            value: "all"
          }, {
            label: "Under 50",
            value: "small"
          }, {
            label: "50 – 10,000",
            value: "mid"
          }, {
            label: "Over 10,000",
            value: "large"
          }]} className="w-auto min-w-[10rem]" />
              <Select aria-label="Filter by location" value={location} onChange={e => {
            setLocation(e.target.value);
            setPage(1);
          }} options={[{
            label: "All locations",
            value: "all"
          }, ...locations.map(l => ({
            label: l,
            value: l
          }))]} className="w-auto min-w-[10rem]" />
            </div>
          </div>

          {loading && <TableSkeleton rows={8} cols={9} />}
          {!loading && <CompaniesTable companies={paginated} />}
          {!loading && filtered.length > 0 && <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />}
        </Card>}
    </div>;
}
