import { API_BASE_URL } from "./constants";
import {
  mockCampaigns,
  mockCompanies,
  mockContacts,
  mockEmployees,
  mockJobs,
  mockLeads,
} from "./mock-data";
import type { Company } from "@/types/company";
import type { Contact } from "@/types/contact";
import type { Job, JobSearchParams, QualificationCheck, SearchResult } from "@/types/job";
import type { Lead, LeadFormValues, LeadStatus } from "@/types/lead";
import type { Campaign } from "@/types/campaign";
import type { Employee, EmployeeFormValues } from "@/types/employee";
import type { MatchResult } from "@/types/match";
import type { CampaignEmail } from "@/types/campaign-email";
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

let jobsStore = [...mockJobs];
let leadsStore = [...mockLeads];
let campaignsStore = [...mockCampaigns];
let employeesStore = [...mockEmployees];
let matchResultsStore: MatchResult[] = [];
let emailsStore: CampaignEmail[] = [];

let jobSeq = jobsStore.length;
let leadSeq = leadsStore.length;
let campaignSeq = campaignsStore.length;
let employeeSeq = employeesStore.length;
let matchSeq = 0;
let emailSeq = 0;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

// Deterministic PRNG seeded from the search filters, so re-running the exact
// same search (a "Recheck") always regenerates the exact same postings —
// which is what lets dedup correctly report "no new job available".
function seededRandom(seedText: string) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) {
    seed = (Math.imul(31, seed) + seedText.charCodeAt(i)) | 0;
  }
  return function next() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Jobs / Search (Search tab)
// ---------------------------------------------------------------------------

// Skills per title mirror the seed employees' skillsets, so the stage-4
// matching step (plain keyword overlap against the job description below)
// actually has something to match against instead of always scoring 0%.
const TITLE_SKILLS: Record<string, string[]> = {
  "Senior Java Developer": ["Java", "Spring", "AWS"],
  "React Frontend Engineer": ["React", "TypeScript", "Next.js"],
  "DevOps Engineer": ["Kubernetes", "AWS", "Terraform"],
  "Data Engineer": ["Python", "Spark", "Airflow"],
  "QA Automation Engineer": ["Selenium", "Python", "CI/CD"],
  "Full Stack Developer": ["React", "Python", "AWS"],
};
const SAMPLE_TITLES = Object.keys(TITLE_SKILLS);
const SAMPLE_COMPANIES = ["Acme Corp", "Northwind Traders", "Globex Inc", "Initech", "Umbrella Solutions"];
const SAMPLE_FIRST_NAMES = ["Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery"];
const SAMPLE_LAST_NAMES = ["Bennett", "Ortiz", "Chen", "Patel", "Novak", "Ibrahim"];

/**
 * Stands in for a real LinkedIn scrape. Swap this out for a real API call
 * once a scraping backend is wired up — every downstream stage only
 * depends on the Job shape returned here.
 */
function scrapeJobs(params: JobSearchParams): Job[] {
  const rand = seededRandom(JSON.stringify(params));
  const count = 4 + Math.floor(rand() * 5);
  const jobs: Job[] = [];

  for (let i = 0; i < count; i++) {
    const title = SAMPLE_TITLES[Math.floor(rand() * SAMPLE_TITLES.length)];
    const companyName = SAMPLE_COMPANIES[Math.floor(rand() * SAMPLE_COMPANIES.length)];
    const applicants = Math.floor(rand() * 150);
    const companySize = [20, 80, 600, 5000, 12000][Math.floor(rand() * 5)];
    const postingId = `${slugify(params.keyword)}-${slugify(companyName)}-${slugify(title)}-${i}`;

    const checks: QualificationCheck[] = [
      {
        label: "Applicant count",
        value: applicants >= 100 ? "100+" : `${applicants}`,
        expected: `maximum ${params.max_applicants ?? 99}`,
        passed: applicants <= (params.max_applicants ?? 99),
      },
      {
        label: "Company size",
        value: `${companySize}`,
        expected: `${params.min_company_size ?? 0}–${params.max_company_size ?? "∞"}`,
        passed: companySize >= (params.min_company_size ?? 0) && companySize <= (params.max_company_size ?? Infinity),
      },
      {
        label: "Job type",
        value: params.job_type,
        expected: params.job_type,
        passed: true,
      },
      {
        label: "Remote",
        value: params.remote,
        expected: params.remote,
        passed: true,
      },
    ];
    const failed = checks.filter((c) => !c.passed);
    const qualified = failed.length === 0;

    const firstName = SAMPLE_FIRST_NAMES[Math.floor(rand() * SAMPLE_FIRST_NAMES.length)];
    const lastName = SAMPLE_LAST_NAMES[Math.floor(rand() * SAMPLE_LAST_NAMES.length)];
    const companyDomain = `${slugify(companyName)}.com`;

    jobSeq += 1;
    jobs.push({
      id: `job_${jobSeq}`,
      campaign_id: "",
      contact: {
        name: `${firstName} ${lastName}`,
        job_title: "Hiring Manager",
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyDomain}`,
        company_name: companyName,
        company_domain: companyDomain,
        contact_type: "job_poster",
        source: "LinkedIn",
      },
      company: {
        company_name: companyName,
        company_domain: companyDomain,
        employee_count: companySize,
      },
      job_posting_id: postingId,
      job_title: `${title} - ${params.keyword}`,
      company_name: companyName,
      job_location: params.location || "Remote",
      job_summary: `${companyName} is hiring a ${title} with experience in ${params.keyword}.`,
      job_description:
        `${companyName} is looking for a ${title} with experience in ${params.keyword}.\n\n` +
        `Requirements:\n- Hands-on experience with ${TITLE_SKILLS[title].join(", ")}\n- ${params.experience_level} experience level`,
      job_seniority_level: params.experience_level,
      job_function: "Engineering",
      job_employment_type: params.job_type as Job["job_employment_type"],
      job_remote_type: params.remote as Job["job_remote_type"],
      job_posted_time: "Just now",
      job_posted_date: new Date().toISOString(),
      job_num_applicants: applicants,
      application_availability: true,
      linkedin_url: `https://linkedin.com/jobs/view/${postingId}`,
      company_employee_count: companySize,
      qualified,
      qualification_reason: qualified
        ? "All configured filters satisfied."
        : failed.map((c) => `${c.label} did not meet ${c.expected}.`).join(" "),
      qualification_checks: checks,
    });
  }
  return jobs;
}

function runSearch(params: JobSearchParams): Promise<SearchResult> {
  const scraped = scrapeJobs(params);
  const existingIds = new Set(jobsStore.map((j) => j.job_posting_id));
  const newJobs = scraped.filter((j) => !existingIds.has(j.job_posting_id));

  if (newJobs.length === 0) {
    return delay({ jobs: [], newJobsFound: false, message: "No new job available." }, 600);
  }

  campaignSeq += 1;
  const campaign: Campaign = {
    id: `camp_${campaignSeq}`,
    name: `Campaign_${todayStamp()}_${slugify(params.keyword)}`,
    role_name: params.keyword,
    search_filters: params,
    stage: "name",
    status: "active",
    created_at: new Date().toISOString(),
  };
  newJobs.forEach((job) => {
    job.campaign_id = campaign.id;
  });

  jobsStore = [...newJobs, ...jobsStore];
  campaignsStore = [campaign, ...campaignsStore];
  return delay({ campaign, jobs: newJobs, newJobsFound: true }, 700);
}

export async function searchJobs(params: JobSearchParams): Promise<SearchResult> {
  if (USE_MOCK) return runSearch(params);
  // TODO: replace with real backend call once /search-jobs is available
  return request<SearchResult>("/search-jobs", { method: "POST", body: JSON.stringify(params) });
}

/** Re-runs the same requirement. Creates a new campaign only if new postings turn up. */
export async function recheckSearch(params: JobSearchParams): Promise<SearchResult> {
  if (USE_MOCK) return runSearch(params);
  // TODO: replace with POST /jobs/recheck
  return request<SearchResult>("/jobs/recheck", { method: "POST", body: JSON.stringify(params) });
}

export async function getJobs(): Promise<Job[]> {
  if (USE_MOCK) return delay([...jobsStore]);
  // TODO: replace with GET /jobs
  return request<Job[]>("/jobs");
}

export async function getJob(jobId: string): Promise<Job | undefined> {
  if (USE_MOCK) return delay(jobsStore.find((j) => j.id === jobId));
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
// Campaigns (5-stage pipeline)
// ---------------------------------------------------------------------------

export async function getCampaigns(): Promise<Campaign[]> {
  if (USE_MOCK) {
    return delay([...campaignsStore].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  }
  // TODO: replace with GET /campaigns
  return request<Campaign[]>("/campaigns");
}

export async function getCampaign(campaignId: string): Promise<Campaign | undefined> {
  if (USE_MOCK) return delay(campaignsStore.find((c) => c.id === campaignId));
  // TODO: replace with GET /campaigns/{campaignId}
  return request<Campaign>(`/campaigns/${campaignId}`);
}

// -- Stage 1: name -----------------------------------------------------------

export async function confirmCampaignName(campaignId: string, name: string): Promise<Campaign> {
  if (USE_MOCK) {
    const campaign = campaignsStore.find((c) => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");
    campaign.name = name || campaign.name;
    campaign.stage = "jobs_review";
    return delay({ ...campaign });
  }
  // TODO: replace with PATCH /campaigns/{id} then POST /campaigns/{id}/confirm-name
  await request(`/campaigns/${campaignId}`, { method: "PATCH", body: JSON.stringify({ name }) });
  return request<Campaign>(`/campaigns/${campaignId}/confirm-name`, { method: "POST" });
}

// -- Stage 2: jobs review -> move to lead -----------------------------------

export async function getCampaignJobs(campaignId: string, tab?: "qualified" | "rejected"): Promise<Job[]> {
  if (USE_MOCK) {
    let jobs = jobsStore.filter((j) => j.campaign_id === campaignId);
    if (tab) jobs = jobs.filter((j) => (tab === "qualified" ? j.qualified : !j.qualified));
    return delay(jobs);
  }
  // TODO: replace with GET /campaigns/{id}/jobs
  const qs = tab ? `?tab=${tab}` : "";
  return request<Job[]>(`/campaigns/${campaignId}/jobs${qs}`);
}

function buildLeadFromJob(job: Job, campaignId: string): Lead {
  leadSeq += 1;
  const now = new Date().toISOString();
  return {
    id: `lead_${leadSeq}`,
    campaign_id: campaignId,
    confirmed: false,
    contact: job.contact,
    company: job.company ?? { company_name: job.company_name },
    job,
    lead_type: job.contact?.contact_type ?? "company_only",
    status: "new",
    source: "Campaign",
    created_at: now,
    updated_at: now,
  };
}

export async function moveJobToLead(campaignId: string, jobId: string): Promise<Lead> {
  if (USE_MOCK) {
    const job = jobsStore.find((j) => j.id === jobId && j.campaign_id === campaignId);
    if (!job) throw new Error("Job not found in this campaign");
    const existing = leadsStore.find((l) => l.campaign_id === campaignId && l.job?.id === jobId);
    if (existing) return delay(existing);
    job.moved_to_lead = true;
    const lead = buildLeadFromJob(job, campaignId);
    leadsStore = [lead, ...leadsStore];
    return delay(lead);
  }
  // TODO: replace with POST /campaigns/{id}/jobs/{jobId}/move-to-lead
  return request<Lead>(`/campaigns/${campaignId}/jobs/${jobId}/move-to-lead`, { method: "POST" });
}

/** Clicking "Next" on stage 2: auto-promotes any qualified job not already moved to a lead. */
export async function advanceJobsStage(campaignId: string): Promise<Campaign> {
  if (USE_MOCK) {
    const campaign = campaignsStore.find((c) => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");
    const remaining = jobsStore.filter((j) => j.campaign_id === campaignId && j.qualified && !j.moved_to_lead);
    remaining.forEach((job) => {
      job.moved_to_lead = true;
      leadsStore = [buildLeadFromJob(job, campaignId), ...leadsStore];
    });
    campaign.stage = "lead_confirm";
    return delay({ ...campaign });
  }
  // TODO: replace with POST /campaigns/{id}/jobs/next
  return request<Campaign>(`/campaigns/${campaignId}/jobs/next`, { method: "POST" });
}

// -- Stage 3: lead confirmation ----------------------------------------------

export async function getCampaignLeads(campaignId: string): Promise<Lead[]> {
  if (USE_MOCK) return delay(leadsStore.filter((l) => l.campaign_id === campaignId));
  // TODO: replace with GET /campaigns/{id}/leads
  return request<Lead[]>(`/campaigns/${campaignId}/leads`);
}

export async function confirmCampaignLeads(campaignId: string, leadIds: string[]): Promise<Campaign> {
  if (leadIds.length === 0) throw new Error("Select at least one lead to proceed.");
  if (USE_MOCK) {
    const campaign = campaignsStore.find((c) => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");
    leadsStore = leadsStore.map((l) =>
      leadIds.includes(l.id) ? { ...l, confirmed: true, status: "qualified" as LeadStatus } : l,
    );
    campaign.stage = "matching";
    return delay({ ...campaign });
  }
  // TODO: replace with POST /campaigns/{id}/leads/confirm
  return request<Campaign>(`/campaigns/${campaignId}/leads/confirm`, {
    method: "POST",
    body: JSON.stringify({ lead_ids: leadIds }),
  });
}

// -- Stage 4: employee matching ------------------------------------------

function scoreEmployeeAgainstJob(employee: Employee, job?: Job): number {
  if (!job || employee.skills.length === 0) return 0;
  const text = `${job.job_title} ${job.job_description ?? job.job_summary ?? ""}`.toLowerCase();
  const hits = employee.skills.filter((skill) => text.includes(skill.toLowerCase())).length;
  return Math.round((hits / employee.skills.length) * 100);
}

export async function runCampaignMatching(campaignId: string): Promise<MatchResult[]> {
  if (USE_MOCK) {
    const confirmedLeads = leadsStore.filter((l) => l.campaign_id === campaignId && l.confirmed);
    const confirmedIds = new Set(confirmedLeads.map((l) => l.id));
    matchResultsStore = matchResultsStore.filter((m) => !confirmedIds.has(m.lead_id));

    const results: MatchResult[] = [];
    confirmedLeads.forEach((lead) => {
      const ranked = employeesStore
        .map((employee) => ({ employee, score: scoreEmployeeAgainstJob(employee, lead.job) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      ranked.forEach(({ employee, score }) => {
        matchSeq += 1;
        results.push({
          id: `match_${matchSeq}`,
          lead_id: lead.id,
          employee,
          match_score: score,
          reasoning:
            score > 0
              ? `${employee.name}'s skills (${employee.skills.join(", ")}) overlap with the ${lead.job?.job_title ?? "role"} requirements.`
              : `${employee.name} has limited overlap with this role's listed requirements.`,
        });
      });
    });

    matchResultsStore = [...matchResultsStore, ...results];
    return delay(results, 900);
  }
  // TODO: replace with POST /campaigns/{id}/matching/run
  return request<MatchResult[]>(`/campaigns/${campaignId}/matching/run`, { method: "POST" });
}

export async function getCampaignMatching(campaignId: string): Promise<MatchResult[]> {
  if (USE_MOCK) {
    const leadIds = new Set(leadsStore.filter((l) => l.campaign_id === campaignId).map((l) => l.id));
    return delay(matchResultsStore.filter((m) => leadIds.has(m.lead_id)));
  }
  // TODO: replace with GET /campaigns/{id}/matching
  return request<MatchResult[]>(`/campaigns/${campaignId}/matching`);
}

export async function confirmCampaignMatching(campaignId: string): Promise<Campaign> {
  if (USE_MOCK) {
    const campaign = campaignsStore.find((c) => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");
    campaign.stage = "email";
    return delay({ ...campaign });
  }
  // TODO: replace with POST /campaigns/{id}/matching/confirm
  return request<Campaign>(`/campaigns/${campaignId}/matching/confirm`, { method: "POST" });
}

// -- Stage 5: email generation + send -----------------------------------

export async function generateCampaignEmail(campaignId: string, leadId: string): Promise<CampaignEmail> {
  if (USE_MOCK) {
    const campaign = campaignsStore.find((c) => c.id === campaignId);
    const lead = leadsStore.find((l) => l.id === leadId);
    if (!campaign || !lead) throw new Error("Campaign or lead not found");

    const matches = matchResultsStore.filter((m) => m.lead_id === leadId);
    const firstName = (lead.contact?.name ?? "there").split(" ")[0];
    const companyName = lead.company?.company_name ?? lead.job?.company_name ?? "your company";
    const jobTitle = lead.job?.job_title ?? "this role";
    const employeeLines = matches.length
      ? matches
          .map((m) => `- ${m.employee.name}, ${m.employee.role_title} (${m.employee.experience_years} yrs) — ${m.employee.skills.join(", ")}`)
          .join("\n")
      : "- (no matched employees)";
    const subject = `Candidates ready for your ${jobTitle} opening at ${companyName}`;
    const content =
      `Hi ${firstName},\n\nWe noticed ${companyName} is hiring for ${jobTitle}. We have the following ` +
      `candidates available now:\n\n${employeeLines}\n\nHappy to set up a quick call this week if you'd ` +
      `like to learn more.\n\nBest regards`;

    let email = emailsStore.find((e) => e.campaign_id === campaignId && e.lead_id === leadId && e.status === "draft");
    if (!email) {
      emailSeq += 1;
      email = {
        id: `email_${emailSeq}`,
        campaign_id: campaignId,
        campaign_name: campaign.name,
        lead_id: leadId,
        lead_name: lead.contact?.name ?? companyName,
        employee_ids: matches.map((m) => m.employee.id),
        from_email: "outreach@leadflow.com",
        to_email: lead.contact?.email ?? "",
        subject,
        content,
        status: "draft",
        created_at: new Date().toISOString(),
      };
      emailsStore = [email, ...emailsStore];
    } else {
      email.subject = subject;
      email.content = content;
      email.employee_ids = matches.map((m) => m.employee.id);
    }
    return delay({ ...email }, 700);
  }
  // TODO: replace with POST /campaigns/{id}/email/generate
  return request<CampaignEmail>(`/campaigns/${campaignId}/email/generate`, {
    method: "POST",
    body: JSON.stringify({ lead_id: leadId }),
  });
}

export async function updateCampaignEmail(
  emailId: string,
  values: Partial<Pick<CampaignEmail, "from_email" | "to_email" | "subject" | "content">>,
): Promise<CampaignEmail> {
  if (USE_MOCK) {
    const email = emailsStore.find((e) => e.id === emailId);
    if (!email) throw new Error("Email not found");
    Object.assign(email, values);
    return delay({ ...email });
  }
  // TODO: replace with PATCH /campaigns/{id}/email/{emailId}
  return request<CampaignEmail>(`/emails/${emailId}`, { method: "PATCH", body: JSON.stringify(values) });
}

export async function sendCampaignEmails(campaignId: string, leadIds: string[]): Promise<CampaignEmail[]> {
  if (USE_MOCK) {
    const campaign = campaignsStore.find((c) => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");
    const targets = emailsStore.filter(
      (e) => e.campaign_id === campaignId && leadIds.includes(e.lead_id) && e.status === "draft",
    );
    if (targets.length === 0) throw new Error("No draft emails found for the selected leads. Generate them first.");

    const now = new Date().toISOString();
    targets.forEach((email) => {
      if (!email.to_email || !email.subject || !email.content) {
        email.status = "failed";
        return;
      }
      email.status = "sent";
      email.sent_at = now;
      leadsStore = leadsStore.map((l) => (l.id === email.lead_id ? { ...l, status: "converted" as LeadStatus } : l));
    });

    const campaignLeads = leadsStore.filter((l) => l.campaign_id === campaignId);
    const allSent =
      campaignLeads.length > 0 &&
      campaignLeads.every((l) => emailsStore.some((e) => e.campaign_id === campaignId && e.lead_id === l.id && e.status === "sent"));
    if (allSent) {
      campaign.stage = "completed";
      campaign.status = "completed";
      campaign.completed_at = now;
    }
    return delay(targets.map((e) => ({ ...e })), 900);
  }
  // TODO: replace with POST /campaigns/{id}/email/send
  return request<CampaignEmail[]>(`/campaigns/${campaignId}/email/send`, {
    method: "POST",
    body: JSON.stringify({ lead_ids: leadIds }),
  });
}

export async function getCampaignEmails(campaignId: string): Promise<CampaignEmail[]> {
  if (USE_MOCK) return delay(emailsStore.filter((e) => e.campaign_id === campaignId));
  // TODO: replace with GET /campaigns/{id}/emails
  return request<CampaignEmail[]>(`/campaigns/${campaignId}/emails`);
}

// ---------------------------------------------------------------------------
// Emails (Email tab, global)
// ---------------------------------------------------------------------------

export async function getEmails(): Promise<CampaignEmail[]> {
  if (USE_MOCK) return delay([...emailsStore].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  // TODO: replace with GET /emails
  return request<CampaignEmail[]>("/emails");
}

export async function getEmail(emailId: string): Promise<CampaignEmail | undefined> {
  if (USE_MOCK) return delay(emailsStore.find((e) => e.id === emailId));
  // TODO: replace with GET /emails/{emailId}
  return request<CampaignEmail>(`/emails/${emailId}`);
}

// ---------------------------------------------------------------------------
// Employees (bench data used for matching)
// ---------------------------------------------------------------------------

function toEmployee(id: string, values: EmployeeFormValues): Employee {
  return {
    id,
    name: values.name,
    role_title: values.role_title,
    skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
    experience_years: Number(values.experience_years) || 0,
    availability: values.availability,
    email: values.email || undefined,
    summary: values.summary || undefined,
  };
}

export async function getEmployees(): Promise<Employee[]> {
  if (USE_MOCK) return delay([...employeesStore]);
  // TODO: replace with GET /employees
  return request<Employee[]>("/employees");
}

export async function createEmployee(values: EmployeeFormValues): Promise<Employee> {
  if (USE_MOCK) {
    employeeSeq += 1;
    const employee = toEmployee(`emp_${employeeSeq}`, values);
    employeesStore = [employee, ...employeesStore];
    return delay(employee);
  }
  // TODO: replace with POST /employees
  return request<Employee>("/employees", { method: "POST", body: JSON.stringify(values) });
}

export async function updateEmployee(employeeId: string, values: EmployeeFormValues): Promise<Employee> {
  if (USE_MOCK) {
    const existing = employeesStore.find((e) => e.id === employeeId);
    if (!existing) throw new Error("Employee not found");
    const updated = toEmployee(employeeId, values);
    employeesStore = employeesStore.map((e) => (e.id === employeeId ? updated : e));
    return delay(updated);
  }
  // TODO: replace with PATCH /employees/{employeeId}
  return request<Employee>(`/employees/${employeeId}`, { method: "PATCH", body: JSON.stringify(values) });
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  if (USE_MOCK) {
    employeesStore = employeesStore.filter((e) => e.id !== employeeId);
    return delay(undefined);
  }
  // TODO: replace with DELETE /employees/{employeeId}
  return request<void>(`/employees/${employeeId}`, { method: "DELETE" });
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
    const qualified = jobsStore.filter((j) => j.qualified).length;
    return delay({
      total_jobs: jobsStore.length,
      qualified_jobs: qualified,
      total_leads: leadsStore.length,
      contacts_found: mockContacts.length,
      jobs_discovered: jobsStore.length,
      jobs_rejected: jobsStore.length - qualified,
      qualification_rate: jobsStore.length ? Math.round((qualified / jobsStore.length) * 100) : 0,
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
