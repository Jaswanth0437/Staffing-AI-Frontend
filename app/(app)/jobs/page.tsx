"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobSearchForm } from "@/components/jobs/JobSearchForm";
import { JobFilters, DEFAULT_JOB_FILTERS } from "@/components/jobs/JobFilters";
import type { JobFilterValues } from "@/components/jobs/JobFilters";
import { JobResultsTable } from "@/components/jobs/JobResultsTable";
import { useToast } from "@/components/ui/Toast";
import { searchJobs } from "@/lib/api";
import type { Job, JobSearchParams } from "@/types/job";

const PAGE_SIZE = 8;

export default function JobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<"all" | "qualified" | "rejected">("all");
  const [filters, setFilters] = useState<JobFilterValues>(DEFAULT_JOB_FILTERS);
  const [page, setPage] = useState(1);

  async function handleSearch(params: JobSearchParams) {
    setLoading(true);
    setError(undefined);
    setPage(1);
    try {
      const result = await searchJobs(params);
      setJobs(result.jobs);
      toast({
        tone: "success",
        title: "Search complete",
        description: `${result.total} jobs found — ${result.qualified} qualified.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search jobs.");
    } finally {
      setLoading(false);
    }
  }

  const locations = useMemo(
    () => Array.from(new Set((jobs ?? []).map((j) => j.job_location).filter(Boolean) as string[])),
    [jobs],
  );

  const filtered = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((job) => {
      if (tab === "qualified" && !job.qualified) return false;
      if (tab === "rejected" && job.qualified) return false;

      if (filters.qualification === "qualified" && !job.qualified) return false;
      if (filters.qualification === "rejected" && job.qualified) return false;

      const size = job.company_employee_count ?? 0;
      if (filters.companySize === "under_50" && size >= 50) return false;
      if (filters.companySize === "in_range" && (size < 50 || size > 10000)) return false;
      if (filters.companySize === "over_10000" && size <= 10000) return false;

      const applicants = job.job_num_applicants ?? 0;
      if (filters.applicants === "under_25" && applicants >= 25) return false;
      if (filters.applicants === "25_99" && (applicants < 25 || applicants > 99)) return false;
      if (filters.applicants === "100_plus" && applicants < 100) return false;

      if (filters.location !== "all" && job.job_location !== filters.location) return false;

      return true;
    });
  }, [jobs, tab, filters]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total = jobs?.length ?? 0;
  const qualifiedCount = jobs?.filter((j) => j.qualified).length ?? 0;
  const rejectedCount = total - qualifiedCount;

  return (
    <div>
      <PageHeader title="Job Discovery" subtitle="Find and qualify relevant job opportunities." />

      <JobSearchForm onSearch={handleSearch} loading={loading} />

      <div className="mt-6">
        {error && <ErrorState description={error} onRetry={() => setError(undefined)} />}

        {!error && !jobs && !loading && (
          <Card className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">Start a job search</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure your search parameters above and click Search Jobs.
            </p>
          </Card>
        )}

        {!error && loading && !jobs && (
          <Card>
            <TableSkeleton rows={8} cols={10} />
          </Card>
        )}

        {!error && jobs && (
          <Card>
            <div className="flex flex-col gap-4 border-b border-border px-5 py-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{total}</span> jobs found ·{" "}
                <span className="font-semibold text-success">{qualifiedCount}</span> qualified ·{" "}
                <span className="font-semibold text-danger">{rejectedCount}</span> rejected
              </p>

              <Tabs
                value={tab}
                onChange={(v) => {
                  setTab(v as typeof tab);
                  setPage(1);
                }}
                items={[
                  { label: "All", value: "all", count: total },
                  { label: "Qualified", value: "qualified", count: qualifiedCount },
                  { label: "Rejected", value: "rejected", count: rejectedCount },
                ]}
              />

              <JobFilters
                values={filters}
                onChange={(v) => {
                  setFilters(v);
                  setPage(1);
                }}
                locations={locations}
              />
            </div>

            <JobResultsTable jobs={paginated} />

            {filtered.length > 0 && (
              <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
