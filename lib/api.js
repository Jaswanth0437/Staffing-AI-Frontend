import { API_BASE_URL } from "./constants";
import { mockJobs, mockLeads } from "./mock-data";
import { titleCase } from "./utils";
/**
 * Set to false once the FastAPI backend endpoints below are live.
 * Every function in this module is written so only USE_MOCK needs to flip.
 */
const USE_MOCK = true;
const MOCK_DELAY_MS = 350;
function delay(value, ms = MOCK_DELAY_MS) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}
async function request(path, init) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // FastAPI error responses are {"detail": "..."} — surface that directly
    // instead of the raw JSON when present.
    let message = body || res.statusText;
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed.detail === "string") message = parsed.detail;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return undefined;
  return res.json();
}
let jobsStore = [...mockJobs];
let leadsStore = [...mockLeads];

// ---------------------------------------------------------------------------
// Campaigns — real backend (Staffing-AI-Backend). Proxied through
// /api/backend/* (see next.config.mjs rewrites) since the FastAPI app has no
// CORS middleware and we don't touch backend code.
// ---------------------------------------------------------------------------

function normalizeCampaign(campaign) {
  return {
    ...campaign,
    role_name: campaign.search_criteria?.job_role ?? "—"
  };
}

export async function getCampaigns() {
  const campaigns = await request("/campaigns");
  return campaigns.map(normalizeCampaign);
}
export async function getCampaign(campaignId) {
  const campaign = await request(`/campaigns/${campaignId}`);
  return normalizeCampaign(campaign);
}

/** POST /campaigns — body: { name, search_criteria }. Runs immediately
 * (status "pending") and does its Apify search + qualification as a
 * BackgroundTask server-side, so this returns before any jobs exist yet —
 * the campaign detail page polls GET /campaigns/{id}(/jobs) until the
 * status flips to "completed"/"failed". */
/** Backend checks for an existing campaign with the same search_criteria
 * first — if found, `is_duplicate` is true and `campaign` is that existing
 * one (nothing new was created), so the caller can redirect to it with a
 * heads-up toast instead of spinning up a duplicate search. */
export async function createCampaign({
  name,
  search_criteria
}) {
  const result = await request("/campaigns", {
    method: "POST",
    body: JSON.stringify({
      name,
      search_criteria
    })
  });
  return {
    ...result,
    campaign: normalizeCampaign(result.campaign)
  };
}

/** POST /campaigns/{id}/recheck — re-runs the same search_criteria the
 * campaign was created with. Jobs already on file are skipped server-side;
 * only genuinely new postings come back with job.is_new set (getCampaignJobs
 * sorts those to the top). Flips the campaign back to "running", so the
 * existing polling effect on the campaign detail page picks it up. */
export async function recheckCampaign(campaignId) {
  const campaign = await request(`/campaigns/${campaignId}/recheck`, {
    method: "POST"
  });
  return normalizeCampaign(campaign);
}

/** DELETE /campaigns/{id} — permanently deletes the campaign and every job,
 * qualification, lead, contact, employee match, and email under it. */
export async function deleteCampaign(campaignId) {
  return request(`/campaigns/${campaignId}`, {
    method: "DELETE"
  });
}

// ---------------------------------------------------------------------------
// Jobs (scoped to a campaign) — real backend
// ---------------------------------------------------------------------------

function normalizeJob(job) {
  const qualified = job.qualification_status === "qualified";
  return {
    ...job,
    job_title: job.title,
    company_name: job.company,
    job_location: job.location,
    job_description: job.description,
    job_num_applicants: job.applicant_count,
    company_employee_count: job.company_employee_size,
    status: job.qualification_status,
    reason: job.reason,
    qualified
  };
}

/** GET /campaigns/{id}/jobs. `tab` filters client-side by
 * qualification_status ("qualified" | "rejected" | "pending"). */
export async function getCampaignJobs(campaignId, tab) {
  const jobs = (await request(`/campaigns/${campaignId}/jobs`)).map(normalizeJob);
  // Newest recheck finds float to the top — stable sort, so it's otherwise
  // a no-op partition rather than a full reorder.
  jobs.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
  return tab ? jobs.filter(j => j.status === tab) : jobs;
}

/** There's no GET /jobs/{id} on this backend — only the campaign-scoped
 * list. The job detail route always has campaignId in its own URL, so we
 * fetch the list and find the one job, rather than adding an endpoint. */
export async function getCampaignJob(campaignId, jobId) {
  const jobs = await getCampaignJobs(campaignId);
  return jobs.find(j => String(j.id) === String(jobId));
}

/** POST /jobs/{id}/qualify — manually override the AI's qualification
 * verdict. Overwrites the existing qualifications row in place and marks
 * decided_by="manual" so the UI can show it was a human call, not the AI's. */
export async function manualQualifyJob(jobId, status, reason) {
  return request(`/jobs/${jobId}/qualify`, {
    method: "POST",
    body: JSON.stringify({
      status,
      reason
    })
  });
}

// ---------------------------------------------------------------------------
// Legacy mock jobs — unrelated to the campaign pipeline above. Backs the
// standalone /jobs/{jobId} route linked from the Dashboard and Company
// detail pages, which predates the campaign flow and has its own mock ids.
// ---------------------------------------------------------------------------

export async function getJobs() {
  if (USE_MOCK) return delay([...jobsStore]);
  return request("/jobs");
}
export async function getJob(jobId) {
  if (USE_MOCK) return delay(jobsStore.find(j => j.id === jobId));
  return request(`/jobs/${jobId}`);
}

// ---------------------------------------------------------------------------
// Apollo contact resolution + lead creation — real backend
// ---------------------------------------------------------------------------

/** POST /jobs/{id}/create-lead — company-level Apollo lookup only on this
 * backend build (job-poster/HR tiers are a stretch goal not yet built
 * server-side); whatever `contact.type` comes back is rendered as-is.
 * Idempotent server-side: calling this again for a job that already has a
 * lead just returns the existing lead_id + contact, which is also how we
 * re-fetch a lead's contact later (see getPipelineLead) since there's no
 * GET-contact-by-lead-id endpoint. */
export async function createLeadFromJob(jobId) {
  const result = await request(`/jobs/${jobId}/create-lead`, {
    method: "POST"
  });
  return {
    ...result,
    contact: {
      ...result.contact,
      job_title: result.contact?.designation
    }
  };
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

/** Shared by getPipelineLead (one) and getLeads (all): GET /leads(/{id})
 * only returns { id, job_id, campaign_id, status, created_at } — no
 * embedded job/contact. Enriches it by fetching the job (via the
 * campaign's job list) and re-resolving the contact (via the idempotent
 * create-lead call, since there's no GET-contact-by-lead-id endpoint). */
async function enrichLead(lead) {
  const [job, created] = await Promise.all([getCampaignJob(lead.campaign_id, lead.job_id), createLeadFromJob(lead.job_id)]);
  return {
    ...lead,
    job,
    contact: created.contact,
    company: job ? {
      company_name: job.company_name,
      employee_count: job.company_employee_count
    } : undefined
  };
}
export async function getPipelineLead(leadId) {
  const lead = await request(`/leads/${leadId}`);
  return enrichLead(lead);
}

/** GET /leads — backs the global Leads tab. Real DB data only; a lead only
 * shows up here once it's actually been created via a job's create-lead
 * call, same as the campaign-scoped view. */
export async function getLeads() {
  const leads = await request("/leads");
  return Promise.all(leads.map(enrichLead));
}
export async function getLead(leadId) {
  if (USE_MOCK) return delay(leadsStore.find(l => l.id === leadId));
  // TODO: replace with GET /leads/{leadId}
  return request(`/leads/${leadId}`);
}
export async function createLead(values) {
  if (USE_MOCK) {
    const now = new Date().toISOString();
    const lead = {
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
        company_name: values.company_name || undefined
      },
      company: {
        company_name: values.company_name || undefined,
        company_website: values.company_website || undefined,
        company_linkedin_url: values.company_linkedin_url || undefined,
        company_domain: values.company_domain || undefined,
        employee_count: values.employee_count ? Number(values.employee_count) : undefined
      }
    };
    leadsStore = [lead, ...leadsStore];
    return delay(lead);
  }
  // TODO: replace with POST /leads
  return request("/leads", {
    method: "POST",
    body: JSON.stringify(values)
  });
}
export async function updateLead(leadId, values) {
  if (USE_MOCK) {
    const existing = leadsStore.find(l => l.id === leadId);
    if (!existing) throw new Error("Lead not found");
    const updated = {
      ...existing,
      status: values.status ?? existing.status,
      notes: values.notes ?? existing.notes,
      updated_at: new Date().toISOString(),
      contact: {
        ...existing.contact,
        name: values.first_name || values.last_name ? `${values.first_name ?? ""} ${values.last_name ?? ""}`.trim() : existing.contact?.name,
        job_title: values.job_title ?? existing.contact?.job_title,
        email: values.email ?? existing.contact?.email,
        phone: values.phone ?? existing.contact?.phone,
        linkedin_url: values.linkedin_url ?? existing.contact?.linkedin_url
      },
      company: {
        ...existing.company,
        company_name: values.company_name ?? existing.company?.company_name,
        company_website: values.company_website ?? existing.company?.company_website,
        company_linkedin_url: values.company_linkedin_url ?? existing.company?.company_linkedin_url,
        company_domain: values.company_domain ?? existing.company?.company_domain,
        employee_count: values.employee_count ? Number(values.employee_count) : existing.company?.employee_count
      }
    };
    leadsStore = leadsStore.map(l => l.id === leadId ? updated : l);
    return delay(updated);
  }
  // TODO: replace with PATCH /leads/{leadId}
  return request(`/leads/${leadId}`, {
    method: "PATCH",
    body: JSON.stringify(values)
  });
}
export async function updateLeadStatus(leadId, status) {
  return updateLead(leadId, {
    status
  });
}
export async function deleteLead(leadId) {
  if (USE_MOCK) {
    leadsStore = leadsStore.filter(l => l.id !== leadId);
    return delay(undefined);
  }
  // TODO: replace with DELETE /leads/{leadId}
  return request(`/leads/${leadId}`, {
    method: "DELETE"
  });
}

// ---------------------------------------------------------------------------
// Employee matching (internal review only — never exposed to outreach copy)
// ---------------------------------------------------------------------------

function normalizeMatch(m) {
  return {
    id: m.id,
    lead_id: m.lead_id,
    employee_id: m.employee_id,
    employee: {
      id: m.employee_id,
      name: m.employee_name,
      role_title: m.employee_role
    },
    match_score: m.match_score,
    reasoning: m.ai_reasoning,
    confirmed: m.confirmed
  };
}

/** POST /leads/{id}/match-employees -> { employee_matches: [...], reason }.
 * `reason` is set to e.g. "no_qualifying_employees" when the AI call
 * legitimately found no fit — not an error, just an empty result. */
export async function matchEmployeesForLead(leadId) {
  const result = await request(`/leads/${leadId}/match-employees`, {
    method: "POST"
  });
  return {
    matches: result.employee_matches.map(normalizeMatch),
    // e.g. "no_qualifying_employees" — a legitimate zero-match verdict from
    // the AI call, not an error, so callers can tell it apart from "haven't
    // run matching yet".
    reason: result.reason ?? null
  };
}
export async function getLeadMatches(leadId) {
  const matches = await request(`/leads/${leadId}/matches`);
  return matches.map(normalizeMatch);
}

/** POST /leads/{id}/confirm-employee — body is { match_id }, the
 * employee_matches row id (NOT the employee_id). */
export async function confirmEmployeeForLead(leadId, matchId) {
  const match = await request(`/leads/${leadId}/confirm-employee`, {
    method: "POST",
    body: JSON.stringify({
      match_id: matchId
    })
  });
  return normalizeMatch(match);
}

// ---------------------------------------------------------------------------
// Email generation + send
// ---------------------------------------------------------------------------

/** POST /leads/{id}/generate-email — works with or without a confirmed
 * employee match; without one, the backend falls back to a fully generic
 * capability pitch instead of referencing specific overlapping skills.
 * Returns the full Email row: { id, subject, body, sender, recipient,
 * status, sent_at }; `id` is needed for every call below. */
export async function generateEmailForLead(leadId) {
  return request(`/leads/${leadId}/generate-email`, {
    method: "POST"
  });
}

/** POST /emails/{id}/regenerate — overwrites the same email row in place. */
export async function regenerateEmail(emailId) {
  return request(`/emails/${emailId}/regenerate`, {
    method: "POST"
  });
}

/** PUT /emails/{id} — body: { subject?, body?, sender?, recipient? }. */
export async function updateEmail(emailId, values) {
  return request(`/emails/${emailId}`, {
    method: "PUT",
    body: JSON.stringify(values)
  });
}

/** POST /emails/{id}/send — sends via Microsoft Graph. 422s if `recipient`
 * isn't set yet, so callers should updateEmail() first if the field was
 * just edited. */
export async function sendEmail(emailId) {
  return request(`/emails/${emailId}/send`, {
    method: "POST"
  });
}

// ---------------------------------------------------------------------------
// Emails (Email tab, global) — real backend
// ---------------------------------------------------------------------------

/** GET /emails. Raw rows only carry lead_id (no campaign_id/lead name), so
 * this cross-references GET /leads once to attach campaign_id for linking
 * back to the lead's page — not a per-email fetch, just one extra call. */
export async function getEmails() {
  const [emails, leads] = await Promise.all([request("/emails"), request("/leads")]);
  const campaignIdByLead = new Map(leads.map(l => [l.id, l.campaign_id]));
  return emails.map(e => ({
    ...e,
    campaign_id: campaignIdByLead.get(e.lead_id)
  }));
}
export async function getEmail(emailId) {
  return request(`/emails/${emailId}`);
}

/** There's no GET /emails?lead_id= filter, and a lead has at most one
 * emails row (generate/regenerate upsert in place) — so find it in the
 * full list. Used to hydrate the lead detail page's draft state when
 * reopening an already-contacted lead, not just right after sending. */
export async function getEmailForLead(leadId) {
  const emails = await request("/emails");
  return emails.find(e => String(e.lead_id) === String(leadId));
}

// ---------------------------------------------------------------------------
// Companies — real backend has no dedicated Company resource, so this is
// derived from every real job's `company` field (GET /jobs, cross-campaign)
// plus real leads for lead counts. A company's "id" in this app is just its
// name, URL-encoded — there's no numeric id to key on.
// ---------------------------------------------------------------------------

/** GET /jobs — every job across every campaign, not scoped to one. Backs
 * Companies/Dashboard, which need a cross-campaign view. */
export async function getAllJobs() {
  const jobs = await request("/jobs");
  return jobs.map(normalizeJob);
}

function aggregateCompanies(jobs, leads) {
  const byName = new Map();
  for (const job of jobs) {
    const name = job.company_name;
    if (!name) continue;
    if (!byName.has(name)) {
      byName.set(name, {
        id: encodeURIComponent(name),
        company_name: name,
        job_count: 0,
        qualified_count: 0,
        lead_count: 0,
        employee_count: undefined,
        locations: new Set()
      });
    }
    const entry = byName.get(name);
    entry.job_count += 1;
    if (job.qualified) entry.qualified_count += 1;
    if (job.company_employee_count != null && entry.employee_count == null) {
      entry.employee_count = job.company_employee_count;
    }
    if (job.job_location) entry.locations.add(job.job_location);
  }
  const companyByJobId = new Map(jobs.map(j => [j.id, j.company_name]));
  for (const lead of leads) {
    const name = companyByJobId.get(lead.job_id);
    if (name && byName.has(name)) byName.get(name).lead_count += 1;
  }
  return Array.from(byName.values()).map(({
    locations,
    ...entry
  }) => ({
    ...entry,
    location: locations.size ? Array.from(locations)[0] : undefined,
    locations: Array.from(locations)
  }));
}

export async function getCompanies() {
  const [jobs, leads] = await Promise.all([getAllJobs(), request("/leads")]);
  return aggregateCompanies(jobs, leads);
}

/** `companyId` is the URL-encoded company name (see aggregateCompanies).
 * Also returns the company's own jobs/leads/contacts for the detail page's
 * tabs, cross-referenced client-side from the same three real list calls
 * rather than a dedicated endpoint. */
export async function getCompany(companyId) {
  const companyName = decodeURIComponent(companyId);
  const [jobs, leads, contacts, emails] = await Promise.all([getAllJobs(), request("/leads"), request("/contacts"), request("/emails")]);
  const company = aggregateCompanies(jobs, leads).find(c => c.company_name === companyName);
  if (!company) return undefined;

  const companyJobs = jobs.filter(j => j.company_name === companyName);
  const jobIds = new Set(companyJobs.map(j => j.id));
  const companyLeads = leads.filter(l => jobIds.has(l.job_id));
  const leadIds = new Set(companyLeads.map(l => l.id));
  const companyContacts = contacts.filter(c => leadIds.has(c.lead_id));
  const companyEmails = emails.filter(e => leadIds.has(e.lead_id)).map(e => ({
    ...e,
    campaign_id: companyLeads.find(l => l.id === e.lead_id)?.campaign_id
  }));

  return {
    ...company,
    jobs: companyJobs,
    leads: companyLeads,
    contacts: companyContacts,
    emails: companyEmails
  };
}

// ---------------------------------------------------------------------------
// Employees (real bench data — synced from Salesforce, read-only here)
// ---------------------------------------------------------------------------

/** GET /employees. Real shape is { id, name, role, skills,
 * experience_summary, seniority } — no experience_years/availability/email
 * like the old mock shape, so those are just left out rather than faked. */
export async function getEmployees() {
  const employees = await request("/employees");
  return employees.map(e => ({
    id: e.id,
    name: e.name,
    role_title: e.role,
    skills: e.skills ?? [],
    seniority: e.seniority,
    summary: e.experience_summary
  }));
}

/** POST /admin/sync-employees — pulls the roster from Salesforce
 * Employee__c (or the mock seed if Salesforce isn't reachable/configured).
 * Employee matching returns nothing until this has been run at least once. */
export async function syncEmployees() {
  return request("/admin/sync-employees", {
    method: "POST"
  });
}

/** PATCH /employees/{id} — manual override on top of the Salesforce-synced
 * roster. Re-running Sync from Salesforce overwrites these fields back to
 * whatever Salesforce has for a matching name. */
export async function updateEmployee(employeeId, values) {
  const employee = await request(`/employees/${employeeId}`, {
    method: "PATCH",
    body: JSON.stringify(values)
  });
  return {
    id: employee.id,
    name: employee.name,
    role_title: employee.role,
    skills: employee.skills ?? [],
    seniority: employee.seniority,
    summary: employee.experience_summary
  };
}

/** DELETE /employees/{id}. Throws with a 409 status if the employee is
 * referenced by an existing match or email — that history can't be deleted
 * along with the employee. Re-running Sync from Salesforce recreates a
 * deleted employee if it's still present in Salesforce. */
export async function deleteEmployee(employeeId) {
  return request(`/employees/${employeeId}`, {
    method: "DELETE"
  });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const mockGeneralSettings = {
  application_name: "Winfomi HireX",
  default_location: "London",
  default_country: "GB",
  default_time_range: "Past 24 hours"
};
const mockIntegrations = [{
  id: "bright_data",
  name: "Bright Data",
  description: "Scrapes LinkedIn job postings used for lead discovery.",
  status: "connected",
  masked_key: "••••••••••••3f2a",
  last_tested_at: "2026-08-15T10:00:00Z"
}, {
  id: "apollo",
  name: "Apollo",
  description: "Enriches job posters and HR contacts with verified emails and phone numbers.",
  status: "connected",
  masked_key: "••••••••••••91cd",
  last_tested_at: "2026-08-15T10:00:00Z"
}];
const mockScrapingSettings = {
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
  max_applicants: 99
};
export async function getGeneralSettings() {
  if (USE_MOCK) return delay(mockGeneralSettings);
  // TODO: replace with GET /settings/general
  return request("/settings/general");
}
export async function updateGeneralSettings(values) {
  if (USE_MOCK) return delay(values);
  // TODO: replace with PUT /settings/general
  return request("/settings/general", {
    method: "PUT",
    body: JSON.stringify(values)
  });
}
export async function getIntegrations() {
  if (USE_MOCK) return delay(mockIntegrations);
  // TODO: replace with GET /settings/integrations
  return request("/settings/integrations");
}
export async function testIntegrationConnection(integrationId) {
  if (USE_MOCK) {
    return delay({
      success: true,
      message: `${integrationId} connection is healthy.`
    }, 800);
  }
  // TODO: replace with POST /settings/integrations/{id}/test
  return request(`/settings/integrations/${integrationId}/test`, {
    method: "POST"
  });
}
export async function getScrapingSettings() {
  if (USE_MOCK) return delay(mockScrapingSettings);
  // TODO: replace with GET /settings/scraping
  return request("/settings/scraping");
}
export async function updateScrapingSettings(values) {
  if (USE_MOCK) return delay(values);
  // TODO: replace with PUT /settings/scraping
  return request("/settings/scraping", {
    method: "PUT",
    body: JSON.stringify(values)
  });
}

// ---------------------------------------------------------------------------
// Dashboard — real backend. No dedicated /dashboard/stats resource, so this
// computes from the same three real lists the Companies/Contacts tabs use;
// no fabricated week-over-week trend since there's no historical snapshot
// to compute one from (StatCard just omits the trend row when unset).
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  const [jobs, leads, contacts] = await Promise.all([getAllJobs(), request("/leads"), request("/contacts")]);
  const qualified = jobs.filter(j => j.qualified).length;
  const rejected = jobs.filter(j => j.status === "rejected").length;
  return {
    total_jobs: jobs.length,
    qualified_jobs: qualified,
    jobs_discovered: jobs.length,
    jobs_rejected: rejected,
    qualification_rate: jobs.length ? Math.round(qualified / jobs.length * 100) : 0,
    total_leads: leads.length,
    contacts_found: contacts.filter(c => c.email).length,
    // Leads actually reached out to (an email sent), not just resolved —
    // a genuine outreach-activity metric distinct from contact resolution.
    leads_contacted: leads.filter(l => l.status === "contacted").length
  };
}

/** GET /admin/activity — every log_activity() call across the backend,
 * most recent first. `action` is already a human-readable message (e.g.
 * "qualification: qualified (...)", "sent", "matched 4 employees"). */
export async function getRecentActivity() {
  const logs = await request("/admin/activity?limit=20");
  return logs.map(log => ({
    id: log.id,
    label: `${titleCase(log.entity_type)} #${log.entity_id}`,
    description: log.action,
    timestamp: log.timestamp
  }));
}
