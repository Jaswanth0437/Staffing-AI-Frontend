import { API_BASE_URL } from "./constants";
import {
  mockCampaigns,
  mockCompanies,
  mockContacts,
  mockJobs,
  mockLeads,
} from "./mock-data";
import type { Company } from "@/types/company";
import type { Contact } from "@/types/contact";
import type { Job, JobSearchParams, JobSearchResult } from "@/types/job";
import type { Lead, LeadFormValues, LeadStatus } from "@/types/lead";
import type { Campaign } from "@/types/campaign";
import type { GeneralSettings, Integration, ScrapingSettings } from "@/types/settings";

/**
 * Set to false once the FastAPI backend endpoints below are live.
 * Every function in this module is written so only USE_MOCK needs to flip.
 */
const USE_MOCK = true;
const MOCK_DELAY_MS = 350;

function delay<T>(value: T, ms = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API request failed (${res.status}): ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

let leadsStore = [...mockLeads];
let campaignsStore = [...mockCampaigns];

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
  if (USE_MOCK) {
    void params;
    const jobs = mockJobs;
    const qualified = jobs.filter((j) => j.qualified).length;
    return delay({ jobs, total: jobs.length, qualified, rejected: jobs.length - qualified }, 600);
  }
  // TODO: replace with real backend call once /search-jobs is available
  return request<JobSearchResult>("/search-jobs", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getJobs(): Promise<Job[]> {
  if (USE_MOCK) return delay(mockJobs);
  // TODO: replace with GET /jobs
  return request<Job[]>("/jobs");
}

export async function getJob(jobId: string): Promise<Job | undefined> {
  if (USE_MOCK) return delay(mockJobs.find((j) => j.id === jobId));
  // TODO: replace with GET /jobs/{jobId}
  return request<Job>(`/jobs/${jobId}`);
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function getLeads(): Promise<Lead[]> {
  if (USE_MOCK) return delay([...leadsStore]);
  // TODO: replace with GET /leads
  return request<Lead[]>("/leads");
}

export async function getLead(leadId: string): Promise<Lead | undefined> {
  if (USE_MOCK) return delay(leadsStore.find((l) => l.id === leadId));
  // TODO: replace with GET /leads/{leadId}
  return request<Lead>(`/leads/${leadId}`);
}

export async function createLead(values: LeadFormValues): Promise<Lead> {
  if (USE_MOCK) {
    const now = new Date().toISOString();
    const lead: Lead = {
      id: `lead_${leadsStore.length + 1}`,
      status: values.status,
      source: values.source,
      lead_type: values.lead_type,
      notes: values.notes,
      created_at: now,
      updated_at: now,
      contact: {
        name: `${values.first_name} ${values.last_name}`.trim(),
        job_title: values.job_title || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        linkedin_url: values.linkedin_url || undefined,
        company_name: values.company_name || undefined,
      },
      company: {
        company_name: values.company_name || undefined,
        company_website: values.company_website || undefined,
        company_linkedin_url: values.company_linkedin_url || undefined,
        company_domain: values.company_domain || undefined,
        employee_count: values.employee_count ? Number(values.employee_count) : undefined,
      },
    };
    leadsStore = [lead, ...leadsStore];
    return delay(lead);
  }
  // TODO: replace with POST /leads
  return request<Lead>("/leads", { method: "POST", body: JSON.stringify(values) });
}

export async function updateLead(leadId: string, values: Partial<LeadFormValues>): Promise<Lead> {
  if (USE_MOCK) {
    const existing = leadsStore.find((l) => l.id === leadId);
    if (!existing) throw new Error("Lead not found");
    const updated: Lead = {
      ...existing,
      status: values.status ?? existing.status,
      notes: values.notes ?? existing.notes,
      updated_at: new Date().toISOString(),
      contact: {
        ...existing.contact,
        name: values.first_name || values.last_name
          ? `${values.first_name ?? ""} ${values.last_name ?? ""}`.trim()
          : existing.contact?.name,
        job_title: values.job_title ?? existing.contact?.job_title,
        email: values.email ?? existing.contact?.email,
        phone: values.phone ?? existing.contact?.phone,
        linkedin_url: values.linkedin_url ?? existing.contact?.linkedin_url,
      },
      company: {
        ...existing.company,
        company_name: values.company_name ?? existing.company?.company_name,
        company_website: values.company_website ?? existing.company?.company_website,
        company_linkedin_url: values.company_linkedin_url ?? existing.company?.company_linkedin_url,
        company_domain: values.company_domain ?? existing.company?.company_domain,
        employee_count: values.employee_count
          ? Number(values.employee_count)
          : existing.company?.employee_count,
      },
    };
    leadsStore = leadsStore.map((l) => (l.id === leadId ? updated : l));
    return delay(updated);
  }
  // TODO: replace with PATCH /leads/{leadId}
  return request<Lead>(`/leads/${leadId}`, { method: "PATCH", body: JSON.stringify(values) });
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<Lead> {
  return updateLead(leadId, { status });
}

export async function deleteLead(leadId: string): Promise<void> {
  if (USE_MOCK) {
    leadsStore = leadsStore.filter((l) => l.id !== leadId);
    return delay(undefined);
  }
  // TODO: replace with DELETE /leads/{leadId}
  return request<void>(`/leads/${leadId}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export async function getCompanies(): Promise<Company[]> {
  if (USE_MOCK) return delay(mockCompanies);
  // TODO: replace with GET /companies
  return request<Company[]>("/companies");
}

export async function getCompany(companyId: string): Promise<Company | undefined> {
  if (USE_MOCK) return delay(mockCompanies.find((c) => c.id === companyId));
  // TODO: replace with GET /companies/{companyId}
  return request<Company>(`/companies/${companyId}`);
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function getContacts(): Promise<Contact[]> {
  if (USE_MOCK) return delay(mockContacts);
  // TODO: replace with GET /contacts
  return request<Contact[]>("/contacts");
}

export async function getContact(contactId: string): Promise<Contact | undefined> {
  if (USE_MOCK) return delay(mockContacts.find((c) => c.id === contactId));
  // TODO: replace with GET /contacts/{contactId}
  return request<Contact>(`/contacts/${contactId}`);
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export async function getCampaigns(): Promise<Campaign[]> {
  if (USE_MOCK) return delay([...campaignsStore]);
  // TODO: replace with GET /campaigns
  return request<Campaign[]>("/campaigns");
}

export async function getCampaign(campaignId: string): Promise<Campaign | undefined> {
  if (USE_MOCK) return delay(campaignsStore.find((c) => c.id === campaignId));
  // TODO: replace with GET /campaigns/{campaignId}
  return request<Campaign>(`/campaigns/${campaignId}`);
}

export async function createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
  if (USE_MOCK) {
    const now = new Date().toISOString();
    const campaign: Campaign = {
      id: `camp_${campaignsStore.length + 1}`,
      name: payload.name ?? "Untitled campaign",
      status: "draft",
      leads_count: payload.leads_count ?? 0,
      created_at: now,
      subject: payload.subject,
      body: payload.body,
      stats: { total: payload.leads_count ?? 0, sent: 0, opened: 0, replied: 0, failed: 0 },
      leads: [],
    };
    campaignsStore = [campaign, ...campaignsStore];
    return delay(campaign);
  }
  // TODO: replace with POST /campaigns
  return request<Campaign>("/campaigns", { method: "POST", body: JSON.stringify(payload) });
}

/**
 * Sends a draft or paused campaign. Frontend never talks to an email provider
 * directly — the backend owns delivery. This only flips local mock state so
 * the UI reflects a "sent" campaign; swap USE_MOCK for the real call when ready.
 */
export async function sendCampaign(campaignId: string): Promise<Campaign> {
  if (USE_MOCK) {
    const existing = campaignsStore.find((c) => c.id === campaignId);
    if (!existing) throw new Error("Campaign not found");
    const now = new Date().toISOString();
    const total = existing.stats?.total ?? existing.leads_count;
    const updated: Campaign = {
      ...existing,
      status: "active",
      last_activity_at: now,
      stats: { total, sent: total, opened: existing.stats?.opened ?? 0, replied: existing.stats?.replied ?? 0, failed: existing.stats?.failed ?? 0 },
      leads: existing.leads?.map((lead) => ({ ...lead, status: lead.status === "pending" ? "sent" : lead.status, last_activity: now })),
    };
    campaignsStore = campaignsStore.map((c) => (c.id === campaignId ? updated : c));
    return delay(updated, 900);
  }
  // TODO: replace with POST /campaigns/{campaignId}/send
  return request<Campaign>(`/campaigns/${campaignId}/send`, { method: "POST" });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const mockGeneralSettings: GeneralSettings = {
  application_name: "LeadFlow",
  default_location: "London",
  default_country: "GB",
  default_time_range: "Past 24 hours",
};

const mockIntegrations: Integration[] = [
  {
    id: "bright_data",
    name: "Bright Data",
    description: "Scrapes LinkedIn job postings used for lead discovery.",
    status: "connected",
    masked_key: "••••••••••••3f2a",
    last_tested_at: "2026-08-15T10:00:00Z",
  },
  {
    id: "apollo",
    name: "Apollo",
    description: "Enriches job posters and HR contacts with verified emails and phone numbers.",
    status: "connected",
    masked_key: "••••••••••••91cd",
    last_tested_at: "2026-08-15T10:00:00Z",
  },
];

const mockScrapingSettings: ScrapingSettings = {
  keyword: "AI/ML Engineer",
  location: "London",
  country: "GB",
  time_range: "Past 24 hours",
  job_type: "Full-time",
  experience_level: "Mid-Senior level",
  remote: "On-site",
  company: "",
  location_radius: "25",
  min_company_employees: 50,
  max_company_employees: 10000,
  max_applicants: 99,
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  if (USE_MOCK) return delay(mockGeneralSettings);
  // TODO: replace with GET /settings/general
  return request<GeneralSettings>("/settings/general");
}

export async function updateGeneralSettings(values: GeneralSettings): Promise<GeneralSettings> {
  if (USE_MOCK) return delay(values);
  // TODO: replace with PUT /settings/general
  return request<GeneralSettings>("/settings/general", { method: "PUT", body: JSON.stringify(values) });
}

export async function getIntegrations(): Promise<Integration[]> {
  if (USE_MOCK) return delay(mockIntegrations);
  // TODO: replace with GET /settings/integrations
  return request<Integration[]>("/settings/integrations");
}

export async function testIntegrationConnection(
  integrationId: Integration["id"],
): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    return delay({ success: true, message: `${integrationId} connection is healthy.` }, 800);
  }
  // TODO: replace with POST /settings/integrations/{id}/test
  return request(`/settings/integrations/${integrationId}/test`, { method: "POST" });
}

export async function getScrapingSettings(): Promise<ScrapingSettings> {
  if (USE_MOCK) return delay(mockScrapingSettings);
  // TODO: replace with GET /settings/scraping
  return request<ScrapingSettings>("/settings/scraping");
}

export async function updateScrapingSettings(values: ScrapingSettings): Promise<ScrapingSettings> {
  if (USE_MOCK) return delay(values);
  // TODO: replace with PUT /settings/scraping
  return request<ScrapingSettings>("/settings/scraping", { method: "PUT", body: JSON.stringify(values) });
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardStats {
  total_jobs: number;
  qualified_jobs: number;
  total_leads: number;
  contacts_found: number;
  jobs_discovered: number;
  jobs_rejected: number;
  qualification_rate: number;
  trend: {
    total_jobs: number;
    qualified_jobs: number;
    total_leads: number;
    contacts_found: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    const qualified = mockJobs.filter((j) => j.qualified).length;
    return delay({
      total_jobs: mockJobs.length,
      qualified_jobs: qualified,
      total_leads: mockLeads.length,
      contacts_found: mockContacts.length,
      jobs_discovered: mockJobs.length,
      jobs_rejected: mockJobs.length - qualified,
      qualification_rate: Math.round((qualified / mockJobs.length) * 100),
      trend: { total_jobs: 12, qualified_jobs: 8, total_leads: 24, contacts_found: 15 },
    });
  }
  // TODO: replace with GET /dashboard/stats
  return request<DashboardStats>("/dashboard/stats");
}

export interface ActivityFeedItem {
  id: string;
  label: string;
  description: string;
  timestamp: string;
}

export async function getRecentActivity(): Promise<ActivityFeedItem[]> {
  if (USE_MOCK) {
    return delay([
      { id: "act_1", label: "New lead created", description: "Jane Smith at Acme AI", timestamp: "2026-08-16T05:30:00Z" },
      { id: "act_2", label: "Job qualified", description: "Full Stack Engineer at Solace HealthTech", timestamp: "2026-08-16T02:30:00Z" },
      { id: "act_3", label: "Apollo enrichment completed", description: "Daniel Reyes enriched with email + phone", timestamp: "2026-08-15T09:00:00Z" },
      { id: "act_4", label: "Lead status changed", description: "Priya Chandrasekaran moved to Qualified", timestamp: "2026-08-15T13:00:00Z" },
      { id: "act_5", label: "Search completed", description: "538 jobs scanned, 7 qualified", timestamp: "2026-08-14T09:00:00Z" },
    ]);
  }
  // TODO: replace with GET /dashboard/activity
  return request<ActivityFeedItem[]>("/dashboard/activity");
}
