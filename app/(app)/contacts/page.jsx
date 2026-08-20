"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { useContacts } from "@/hooks/useContacts";
const PAGE_SIZE = 8;
export default function ContactsPage() {
  const {
    data: contacts,
    loading,
    error,
    refetch
  } = useContacts();
  const [search, setSearch] = useState("");
  const [contactType, setContactType] = useState("all");
  const [company, setCompany] = useState("all");
  const [page, setPage] = useState(1);
  const companies = useMemo(() => Array.from(new Set((contacts ?? []).map(c => c.company_name).filter(Boolean))), [contacts]);
  const filtered = useMemo(() => {
    if (!contacts) return [];
    return contacts.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${c.name ?? ""} ${c.email ?? ""} ${c.company_name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (contactType !== "all" && c.contact_type !== contactType) return false;
      if (company !== "all" && c.company_name !== company) return false;
      return true;
    });
  }, [contacts, search, contactType, company]);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <div>
      <PageHeader title="Contacts" subtitle="Job posters and HR contacts enriched via Apollo." />

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && <Card>
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={search} onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }} placeholder="Search contacts..." aria-label="Search contacts" className="focus-ring h-9 w-full rounded-lg border border-border-strong bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select aria-label="Filter by contact type" value={contactType} onChange={e => {
            setContactType(e.target.value);
            setPage(1);
          }} options={[{
            label: "All contact types",
            value: "all"
          }, {
            label: "Job Poster",
            value: "job_poster"
          }, {
            label: "HR Recruiter",
            value: "hr_recruiter"
          }]} className="w-auto min-w-[10rem]" />
              <Select aria-label="Filter by company" value={company} onChange={e => {
            setCompany(e.target.value);
            setPage(1);
          }} options={[{
            label: "All companies",
            value: "all"
          }, ...companies.map(c => ({
            label: c,
            value: c
          }))]} className="w-auto min-w-[10rem]" />
            </div>
          </div>

          {loading && <TableSkeleton rows={8} cols={8} />}
          {!loading && <ContactsTable contacts={paginated} />}
          {!loading && filtered.length > 0 && <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />}
        </Card>}
    </div>;
}
