import type { Contact } from "./contact";
import type { Company } from "./company";
import type { Job } from "./job";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "rejected";

export type LeadType = "job_poster" | "hr_recruiter" | "company_only";

export interface Lead {
  id: string;
  campaign_id?: string;
  confirmed?: boolean;
  contact?: Contact;
  company?: Company;
  job?: Job;
  lead_type?: LeadType;
  status: LeadStatus;
  source: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface LeadFormValues {
  first_name: string;
  last_name: string;
  job_title: string;
  email: string;
  phone: string;
  linkedin_url: string;
  company_name: string;
  company_website: string;
  company_linkedin_url: string;
  company_domain: string;
  employee_count: string;
  lead_type: LeadType;
  source: string;
  status: LeadStatus;
  notes: string;
}

export interface ActivityEvent {
  id: string;
  label: string;
  description?: string;
  timestamp: string;
}
