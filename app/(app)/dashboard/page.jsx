"use client";

import { Briefcase, CheckCircle2, Users, UserSearch } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/dashboard/StatCard";
import { JobDiscoveryChart } from "@/components/dashboard/JobDiscoveryChart";
import { RecentQualifiedJobsTable } from "@/components/dashboard/RecentQualifiedJobsTable";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getAllJobs, getDashboardStats, getRecentActivity } from "@/lib/api";
import { useLeads } from "@/hooks/useLeads";
export default function DashboardPage() {
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    refetch
  } = useAsyncData(() => getDashboardStats(), []);
  const {
    data: activity,
    loading: activityLoading
  } = useAsyncData(() => getRecentActivity(), []);
  const {
    data: jobs,
    loading: jobsLoading
  } = useAsyncData(() => getAllJobs(), []);
  const {
    data: leads,
    loading: leadsLoading
  } = useLeads();
  return <div>
      <PageHeader title="Good morning" subtitle="Here's what's happening with your leads today." />

      {statsError && <ErrorState description={statsError} onRetry={refetch} />}

      {!statsError && <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsLoading || !stats ? Array.from({
          length: 4
        }).map((_, i) => <CardSkeleton key={i} />) : <>
                <StatCard label="Total Jobs" value={stats.total_jobs.toString()} icon={<Briefcase className="h-4 w-4" />} />
                <StatCard label="Qualified Jobs" value={stats.qualified_jobs.toString()} icon={<CheckCircle2 className="h-4 w-4" />} />
                <StatCard label="Total Leads" value={stats.total_leads.toString()} icon={<Users className="h-4 w-4" />} />
                <StatCard label="Contacts Found" value={stats.contacts_found.toString()} icon={<UserSearch className="h-4 w-4" />} />
              </>}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Job discovery overview" subtitle="Breakdown of jobs discovered this period" />
              <div className="px-5 py-5">
                {statsLoading || !stats ? <CardSkeleton /> : <JobDiscoveryChart discovered={stats.jobs_discovered} qualified={stats.qualified_jobs} rejected={stats.jobs_rejected} rate={stats.qualification_rate} />}
              </div>
            </Card>

            <RecentActivityFeed items={activity} loading={activityLoading} />
          </div>

          <div className="mt-6 flex flex-col gap-6">
            <RecentQualifiedJobsTable jobs={jobs} loading={jobsLoading} />
            <RecentLeadsTable leads={leads} loading={leadsLoading} />
          </div>
        </>}
    </div>;
}
