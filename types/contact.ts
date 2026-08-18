export type ContactType = "job_poster" | "hr_recruiter";

export interface Contact {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  company_name?: string;
  company_domain?: string;
  contact_type?: ContactType;
  apollo_person_id?: string;
  source?: string;
  enrichment_status?: "enriched" | "pending" | "not_found";
  created_at?: string;
  updated_at?: string;
}
