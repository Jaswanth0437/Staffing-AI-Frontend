import type { Contact } from "./contact";
import type { Company } from "./company";

export type RemoteType = "On-site" | "Remote" | "Hybrid";
export type JobEmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Temporary";

export interface QualificationCheck {
  label: string;
  value: string;
  expected: string;
  passed: boolean;
}

export interface Job {
  id: string;
  campaign_id: string;
  moved_to_lead?: boolean;
  job_posting_id: string;
  job_title: string;
  company_name: string;
  company_id?: string;
  company_url?: string;
  job_location?: string;
  job_summary?: string;
  job_description?: string;
  job_seniority_level?: string;
  job_function?: string;
  job_employment_type?: JobEmploymentType;
  job_industries?: string;
  job_remote_type?: RemoteType;
  job_posted_time?: string;
  job_posted_date?: string;
  job_num_applicants?: number;
  application_availability?: boolean;
  linkedin_url?: string;

  company_employee_count?: number;

  qualified: boolean;
  qualification_reason?: string;
  rejection_reasons?: string[];
  qualification_checks?: QualificationCheck[];

  contact?: Contact;
  company?: Company;
}

export interface JobSearchParams {
  keyword: string;
  location: string;
  country: string;
  time_range: string;
  job_type: string;
  experience_level: string;
  remote: string;
  company?: string;
  location_radius?: string;
  max_applicants?: number;
  min_company_size?: number;
  max_company_size?: number;
}

/**
 * Every search creates a new campaign for whatever new postings it finds.
 * `campaign` is undefined when the search/recheck turns up nothing new.
 */
export interface SearchResult {
  campaign?: import("./campaign").Campaign;
  jobs: Job[];
  newJobsFound: boolean;
  message?: string;
}
