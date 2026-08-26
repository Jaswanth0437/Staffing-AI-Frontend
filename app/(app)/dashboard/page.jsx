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
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { titleCaseSentence } from "@/lib/utils";

// A real greeting (matches the time of day), personalized with the logged-in
// user's first name instead of addressing no one in particular.
function getGreeting(name) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = name?.trim().split(/\s+/)[0];
  return firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;
}

// Generic rotating lines — used only as a fallback before stats have
// loaded, or on a genuinely empty account where there's no pipeline state
// yet to talk about.
const FALLBACK_TAGLINES = ["Here's what's happening with your leads today.", "Your pipeline at a glance — let's see what's moving.", "Fresh jobs, fresh leads — here's today's snapshot.", "Let's see what the pipeline's been up to."];

// Prefers a line that actually reflects the current pipeline state over a
// generic rotating one, so the banner says something different as the
// account's real data changes rather than cycling the same few lines.
function getTagline(stats) {
  if (!stats) return FALLBACK_TAGLINES[new Date().getDate() % FALLBACK_TAGLINES.length];
  const { total_jobs, qualified_jobs, total_leads, contacts_found } = stats;
  if (total_jobs === 0) return "No campaigns running yet — create one to start discovering roles.";
  if (total_leads > 0 && contacts_found > 0) return `${total_leads} lead${total_leads === 1 ? "" : "s"} in motion with ${contacts_found} contact${contacts_found === 1 ? "" : "s"} resolved — keep the outreach going.`;
  if (qualified_jobs > 0 && total_leads === 0) return `${qualified_jobs} job${qualified_jobs === 1 ? "" : "s"} qualified and ready — turn one into a lead.`;
  if (total_leads > 0) return `${total_leads} lead${total_leads === 1 ? "" : "s"} on the board, waiting on a resolved contact.`;
  return `${total_jobs} job${total_jobs === 1 ? "" : "s"} discovered so far — still working through qualification.`;
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
  const currentUser = useCurrentUser();
  return <div>
      <div className="relative mb-6 overflow-hidden rounded-2xl px-6 py-9 shadow-lg sm:px-9" style={{
      background: "var(--hero-gradient)"
    }}>
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
        <svg className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5 opacity-25" style={{
        maskImage: "linear-gradient(to left, black 15%, transparent 95%)",
        WebkitMaskImage: "linear-gradient(to left, black 15%, transparent 95%)"
      }} aria-hidden="true">
          <defs>
            <pattern id="hero-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="1.6" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        <svg className="pointer-events-none absolute -right-6 top-1/2 h-40 w-40 -translate-y-1/2 opacity-20 sm:h-52 sm:w-52" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="49" stroke="white" strokeWidth="1" />
          <circle cx="50" cy="50" r="34" stroke="white" strokeWidth="1" />
          <circle cx="50" cy="50" r="19" stroke="white" strokeWidth="1" />
        </svg>
        <div className="relative">
          <h1 className="animate-page-in text-2xl font-bold tracking-tight text-white sm:text-3xl">{getGreeting(currentUser.name)}</h1>
          <p className="animate-page-in mt-1.5 max-w-md text-sm text-white/70" style={{ animationDelay: "40ms" }}>{titleCaseSentence(getTagline(stats))}</p>
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
                <StatCard label="Lead Outreached" value={stats.leads_contacted.toString()} icon={<UserSearch className="h-4 w-4" />} tone="warning" />
              </>}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="flex flex-col lg:col-span-2">
              <CardHeader title="Job Discovery Overview" subtitle="Breakdown Of Jobs Discovered This Period" />
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
