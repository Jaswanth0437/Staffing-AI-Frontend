"use client";

import { Briefcase, CheckCircle2, Users, UserSearch } from "lucide-react";
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

// A real greeting (matches the time of day) paired with a rotating tagline
// instead of the same static "Good morning / here's what's happening"
// every visit — rotates by day-of-month so it's stable within a session
// rather than changing on every render.
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
const DASHBOARD_TAGLINES = ["Here's what's happening with your leads today.", "Your pipeline at a glance — let's see what's moving.", "Fresh jobs, fresh leads — here's today's snapshot.", "A quick look at where your outreach stands right now.", "Here's the latest from your hiring radar.", "Let's see what the pipeline's been up to."];
function getTagline() {
  return DASHBOARD_TAGLINES[new Date().getDate() % DASHBOARD_TAGLINES.length];
}
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
      <div className="relative mb-6 overflow-hidden rounded-2xl px-6 py-9 shadow-lg sm:px-9" style={{
      background: "var(--hero-gradient)"
    }}>
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <h1 className="animate-page-in text-2xl font-bold tracking-tight text-white sm:text-3xl">{getGreeting()}</h1>
          <p className="animate-page-in mt-1.5 text-sm text-white/70" style={{ animationDelay: "40ms" }}>{getTagline()}</p>
        </div>
      </div>

      {statsError && <ErrorState description={statsError} onRetry={refetch} />}

      {!statsError && <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsLoading || !stats ? Array.from({
          length: 4
        }).map((_, i) => <CardSkeleton key={i} />) : <>
                <StatCard label="Total Jobs" value={stats.total_jobs.toString()} icon={<Briefcase className="h-4 w-4" />} tone="info" />
                <StatCard label="Qualified Jobs" value={stats.qualified_jobs.toString()} icon={<CheckCircle2 className="h-4 w-4" />} tone="brand" />
                <StatCard label="Total Leads" value={stats.total_leads.toString()} icon={<Users className="h-4 w-4" />} tone="violet" />
                <StatCard label="Contacts Found" value={stats.contacts_found.toString()} icon={<UserSearch className="h-4 w-4" />} tone="warning" />
              </>}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="flex flex-col lg:col-span-2">
              <CardHeader title="Job discovery overview" subtitle="Breakdown of jobs discovered this period" />
              <div className="flex flex-1 items-center justify-center px-5 py-5">
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
