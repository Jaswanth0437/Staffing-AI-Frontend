"use client";

import { useState } from "react";
import { Briefcase, Eye, UserPlus } from "lucide-react";
import { CardHeader } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { QualificationBadge } from "@/components/jobs/QualificationBadge";
import { JobQualificationChecks } from "@/components/jobs/JobQualificationChecks";
import { useToast } from "@/components/ui/Toast";
import { useCampaignJobs } from "@/hooks/useCampaigns";
import { advanceJobsStage, moveJobToLead } from "@/lib/api";
import { formatApplicants } from "@/lib/utils";
export function JobsReviewStep({
  campaignId,
  onAdvanced
}) {
  const {
    data: jobs,
    loading,
    refetch
  } = useCampaignJobs(campaignId);
  const {
    toast
  } = useToast();
  const [tab, setTab] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [moving, setMoving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const filtered = (jobs ?? []).filter(j => {
    if (tab === "qualified") return j.qualified;
    if (tab === "rejected") return !j.qualified;
    return true;
  });
  const qualifiedCount = (jobs ?? []).filter(j => j.qualified).length;
  const rejectedCount = (jobs ?? []).length - qualifiedCount;
  async function handleMoveToLead(job) {
    setMoving(true);
    try {
      await moveJobToLead(campaignId, job.id);
      toast({
        tone: "success",
        title: "Moved to lead",
        description: `${job.job_title} was added to leads.`
      });
      refetch();
      setSelectedJob(null);
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to move to lead",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setMoving(false);
    }
  }
  async function handleNext() {
    setAdvancing(true);
    try {
      await advanceJobsStage(campaignId);
      onAdvanced();
    } catch (err) {
      toast({
        tone: "error",
        title: "Failed to continue",
        description: err instanceof Error ? err.message : undefined
      });
    } finally {
      setAdvancing(false);
    }
  }
  return <>
      <CardHeader title="Jobs Found" subtitle="Jobs discovered from the LinkedIn scrape for this campaign. Click a job to view details and move it to Lead." />
      <div className="border-b border-border px-5 py-3">
        <Tabs value={tab} onChange={v => setTab(v)} items={[{
        label: "All",
        value: "all",
        count: jobs?.length ?? 0
      }, {
        label: "Qualified",
        value: "qualified",
        count: qualifiedCount
      }, {
        label: "Rejected",
        value: "rejected",
        count: rejectedCount
      }]} />
      </div>

      {loading && <TableSkeleton rows={5} cols={6} />}

      {!loading && filtered.length === 0 && <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No jobs in this tab" />}

      {!loading && filtered.length > 0 && <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Job Title</TH>
                <TH>Company</TH>
                <TH>Location</TH>
                <TH>Applicants</TH>
                <TH>Qualification</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.map(job => <TR key={job.id}>
                  <TD className="font-medium text-foreground">{job.job_title}</TD>
                  <TD className="text-muted-foreground">{job.company_name}</TD>
                  <TD className="text-muted-foreground">{job.job_location}</TD>
                  <TD className="text-muted-foreground">{formatApplicants(job.job_num_applicants)}</TD>
                  <TD>
                    <QualificationBadge qualified={job.qualified} />
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => setSelectedJob(job)}>
                        View
                      </Button>
                      {job.qualified && <Button size="sm" variant={job.moved_to_lead ? "secondary" : "primary"} disabled={job.moved_to_lead} icon={<UserPlus className="h-3.5 w-3.5" />} onClick={() => handleMoveToLead(job)}>
                          {job.moved_to_lead ? "Moved" : "Move to Lead"}
                        </Button>}
                    </div>
                  </TD>
                </TR>)}
            </TBody>
          </Table>
        </TableContainer>}

      <div className="flex items-center justify-end border-t border-border px-5 py-4">
        <Button onClick={handleNext} loading={advancing}>
          Next
        </Button>
      </div>

      <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)} title={selectedJob?.job_title ?? ""} size="lg">
        {selectedJob && <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <QualificationBadge qualified={selectedJob.qualified} />
              <span className="text-sm text-muted-foreground">
                {selectedJob.company_name} · {selectedJob.job_location}
              </span>
            </div>
            <p className="whitespace-pre-line text-sm text-foreground">{selectedJob.job_description}</p>
            {selectedJob.qualification_checks && <JobQualificationChecks checks={selectedJob.qualification_checks} />}
            {selectedJob.qualified && <Button className="self-start" variant={selectedJob.moved_to_lead ? "secondary" : "primary"} disabled={selectedJob.moved_to_lead} loading={moving} icon={<UserPlus className="h-4 w-4" />} onClick={() => handleMoveToLead(selectedJob)}>
                {selectedJob.moved_to_lead ? "Already moved to lead" : "Move to Lead"}
              </Button>}
          </div>}
      </Modal>
    </>;
}
