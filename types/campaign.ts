import type { JobSearchParams } from "./job";

export type CampaignStage =
  | "name"
  | "jobs_review"
  | "lead_confirm"
  | "matching"
  | "email"
  | "completed";

export type CampaignStatus = "active" | "completed";

export interface Campaign {
  id: string;
  name: string;
  role_name: string;
  search_filters: JobSearchParams;
  stage: CampaignStage;
  status: CampaignStatus;
  created_at: string;
  completed_at?: string;
}

export const CAMPAIGN_STAGE_ORDER: CampaignStage[] = [
  "name",
  "jobs_review",
  "lead_confirm",
  "matching",
  "email",
  "completed",
];

export const CAMPAIGN_STAGE_LABELS: Record<CampaignStage, string> = {
  name: "Name",
  jobs_review: "Jobs Review",
  lead_confirm: "Lead Confirmation",
  matching: "Employee Matching",
  email: "Email Outreach",
  completed: "Completed",
};
