export interface GeneralSettings {
  application_name: string;
  default_location: string;
  default_country: string;
  default_time_range: string;
}

export type IntegrationStatus = "connected" | "not_connected";

export interface Integration {
  id: "bright_data" | "apollo";
  name: string;
  description: string;
  status: IntegrationStatus;
  masked_key?: string;
  last_tested_at?: string;
}

export interface ScrapingSettings {
  keyword: string;
  location: string;
  country: string;
  time_range: string;
  job_type: string;
  experience_level: string;
  remote: string;
  company: string;
  location_radius: string;
  min_company_employees: number;
  max_company_employees: number;
  max_applicants: number;
}
