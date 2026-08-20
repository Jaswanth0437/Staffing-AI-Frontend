import { API_BASE_URL } from "./constants";
import { mockCampaigns, mockCompanies, mockContacts, mockEmployees, mockJobs, mockLeads } from "./mock-data";
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
    throw new Error(`API request failed (${res.status}): ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined;
  return res.json();
}
let jobsStore = [...mockJobs];
let leadsStore = [...mockLeads];
let campaignsStore = [...mockCampaigns];
let employeesStore = [...mockEmployees];
let matchResultsStore = [];
let emailsStore = [];
let jobSeq = jobsStore.length;
let leadSeq = leadsStore.length;
let campaignSeq = campaignsStore.length;
let employeeSeq = employeesStore.length;
let matchSeq = 0;
let emailSeq = 0;
function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function todayStamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

// Deterministic PRNG so mock scrapes/cascades are reproducible from a seed
// string (needed so "Recheck" can meaningfully dedup against past results).
function seededRandom(seedText) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) {
    seed = Math.imul(31, seed) + seedText.charCodeAt(i) | 0;
  }
  return function next() {
    seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

// ---------------------------------------------------------------------------
// Apify job scrape stand-in
// ---------------------------------------------------------------------------

// Skills per title mirror the seed employees' skillsets, so employee matching
// (plain keyword overlap against the job description below) has something to
// match against instead of always scoring 0.
const TITLE_SKILLS = {
  "Senior Java Developer": ["Java", "Spring", "AWS"],
  "React Frontend Engineer": ["React", "TypeScript", "Next.js"],
  "DevOps Engineer": ["Kubernetes", "AWS", "Terraform"],
  "Data Engineer": ["Python", "Spark", "Airflow"],
  "QA Automation Engineer": ["Selenium", "Python", "CI/CD"],
  "Full Stack Developer": ["React", "Python", "AWS"]
};
const SAMPLE_TITLES = Object.keys(TITLE_SKILLS);
const SAMPLE_COMPANIES = ["Acme Corp", "Northwind Traders", "Globex Inc", "Initech", "Umbrella Solutions"];
const SAMPLE_FIRST_NAMES = ["Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery"];
const SAMPLE_LAST_NAMES = ["Bennett", "Ortiz", "Chen", "Patel", "Novak", "Ibrahim"];

/**
 * Stands in for a real Apify job search. Swap this out for a real call once
 * the scraping backend is wired up — every downstream step only depends on
 * the Job shape returned here. `nonce` shifts the seed so a recheck of the
 * same criteria can turn up a different (but still deterministic) result.
 */
function scrapeJobs(params, nonce = 0) {
  const rand = seededRandom(JSON.stringify(params) + `::${nonce}`);
  const count = 4 + Math.floor(rand() * 5);
  const jobs = [];
  for (let i = 0; i < count; i++) {
    const title = pick(SAMPLE_TITLES, rand);
    const companyName = pick(SAMPLE_COMPANIES, rand);
    const applicants = Math.floor(rand() * 150);
    const companySize = pick([20, 80, 600, 5000, 12000], rand);
    const postingId = `${slugify(params.keyword)}-${slugify(companyName)}-${slugify(title)}-${nonce}-${i}`;
    const checks = [{
      label: "Applicant count",
      value: applicants >= 100 ? "100+" : `${applicants}`,
      expected: `maximum ${params.max_applicants ?? 99}`,
      passed: applicants <= (params.max_applicants ?? 99)
    }, {
      label: "Company size",
      value: `${companySize}`,
      expected: `${params.min_company_size ?? 0}–${params.max_company_size ?? "∞"}`,
      passed: companySize >= (params.min_company_size ?? 0) && companySize <= (params.max_company_size ?? Infinity)
    }, {
      label: "Job type",
      value: params.job_type,
      expected: params.job_type,
      passed: true
    }, {
      label: "Remote",
      value: params.remote,
      expected: params.remote,
      passed: true
    }];
    const failed = checks.filter(c => !c.passed);
    const qualified = failed.length === 0;
    const reason = qualified ? "All configured filters satisfied." : failed.map(c => `${c.label} did not meet ${c.expected}.`).join(" ");
    const companyDomain = `${slugify(companyName)}.com`;

    // Real Apify listings only sometimes expose a named poster/LinkedIn URL —
    // simulate that so the Apollo cascade has a real tier-1 path to try.
    let posterContact = null;
    if (rand() < 0.5) {
      const firstName = pick(SAMPLE_FIRST_NAMES, rand);
      const lastName = pick(SAMPLE_LAST_NAMES, rand);
      posterContact = {
        name: `${firstName} ${lastName}`,
        job_title: "Hiring Manager",
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyDomain}`,
        linkedin_url: `https://linkedin.com/in/${slugify(firstName + "-" + lastName)}`
      };
    }
    jobSeq += 1;
    jobs.push({
      id: `job_${jobSeq}`,
      campaign_id: "",
      contact: posterContact,
      company: {
        company_name: companyName,
        company_domain: companyDomain,
        employee_count: companySize
      },
      job_posting_id: postingId,
      job_title: `${title} - ${params.keyword}`,
      company_name: companyName,
      job_location: params.location || "Remote",
      job_summary: `${companyName} is hiring a ${title} with experience in ${params.keyword}.`,
      job_description: `${companyName} is looking for a ${title} with experience in ${params.keyword}.\n\n` + `Requirements:\n- Hands-on experience with ${TITLE_SKILLS[title].join(", ")}\n- ${params.experience_level} experience level`,
      job_seniority_level: params.experience_level,
      job_function: "Engineering",
      job_employment_type: params.job_type,
      job_remote_type: params.remote,
      job_posted_time: "Just now",
      job_posted_date: new Date().toISOString(),
      job_num_applicants: applicants,
      application_availability: true,
      linkedin_url: `https://linkedin.com/jobs/view/${postingId}`,
      company_employee_count: companySize,
      // `status`/`reason` match the integration contract; `qualified`/
      // `qualification_reason` are kept alongside for the legacy
      // dashboard/company pages that already read those field names.
      status: qualified ? "qualified" : "rejected",
      reason,
      qualified,
      qualification_reason: reason,
      qualification_checks: checks
    });
  }
  return jobs;
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export async function getCampaigns() {
  if (USE_MOCK) {
    return delay([...campaignsStore].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  }
  return request("/campaigns");
}
export async function getCampaign(campaignId) {
  if (USE_MOCK) return delay(campaignsStore.find(c => c.id === campaignId));
  return request(`/campaigns/${campaignId}`);
}

/** POST /campaigns — the "New Campaign" form. Always creates a campaign and
 * pulls its initial job set (dedup only applies to recheck, not creation). */
export async function createCampaign(params) {
  if (USE_MOCK) {
    campaignSeq += 1;
    const campaign = {
      id: `camp_${campaignSeq}`,
      name: `Campaign_${todayStamp()}_${slugify(params.keyword)}`,
      role_name: params.keyword,
      search_filters: params,
      status: "active",
      recheck_count: 0,
      created_at: new Date().toISOString()
    };
    const jobs = scrapeJobs(params, 0);
    jobs.forEach(job => {
      job.campaign_id = campaign.id;
    });
    campaignsStore = [campaign, ...campaignsStore];
    jobsStore = [...jobs, ...jobsStore];
    return delay({
      campaign,
      jobs
    }, 700);
  }
  return request("/campaigns", {
    method: "POST",
    body: JSON.stringify(params)
  });
}

/** POST /campaigns/{id}/recheck — re-runs the campaign's own search criteria
 * and adds only postings not already seen for THIS campaign (dedup on
 * external_job_id / job_posting_id), per the spec. */
export async function recheckCampaign(campaignId) {
  if (USE_MOCK) {
    const campaign = campaignsStore.find(c => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found");
    campaign.recheck_count = (campaign.recheck_count ?? 0) + 1;
    const scraped = scrapeJobs(campaign.search_filters, campaign.recheck_count);
    const existingIds = new Set(jobsStore.filter(j => j.campaign_id === campaignId).map(j => j.job_posting_id));
    const newJobs = scraped.filter(j => !existingIds.has(j.job_posting_id));
    if (newJobs.length === 0) {
      return delay({
        newJobsFound: false,
        jobs: [],
        message: "No new job available."
      }, 600);
    }
    newJobs.forEach(job => {
      job.campaign_id = campaignId;
    });
    jobsStore = [...newJobs, ...jobsStore];
    return delay({
      newJobsFound: true,
      jobs: newJobs
    }, 600);
  }
  return request(`/campaigns/${campaignId}/recheck`, {
    method: "POST"
  });
}

// ---------------------------------------------------------------------------
// Jobs (scoped to a campaign)
// ---------------------------------------------------------------------------

/** GET /campaigns/{id}/jobs */
export async function getCampaignJobs(campaignId, tab) {
  if (USE_MOCK) {
    let jobs = jobsStore.filter(j => j.campaign_id === campaignId).map(j => ({
      ...j,
      status: j.status ?? (j.qualified ? "qualified" : "rejected"),
      reason: j.reason ?? j.qualification_reason
    }));
    if (tab) jobs = jobs.filter(j => j.status === tab);
    return delay(jobs);
  }
  const qs = tab ? `?tab=${tab}` : "";
  return request(`/campaigns/${campaignId}/jobs${qs}`);
}

/** GET /jobs/{id} — needed for the job detail route/direct link/refresh. */
export async function getJob(jobId) {
  if (USE_MOCK) {
    const job = jobsStore.find(j => j.id === jobId);
    if (!job) return delay(undefined);
    return delay({
      ...job,
      status: job.status ?? (job.qualified ? "qualified" : "rejected"),
      reason: job.reason ?? job.qualification_reason
    });
  }
  return request(`/jobs/${jobId}`);
}
export async function getJobs() {
  if (USE_MOCK) return delay([...jobsStore]);
  return request("/jobs");
}

// ---------------------------------------------------------------------------
// Apollo cascade: job poster -> HR/recruiting contact -> company-level
// ---------------------------------------------------------------------------

function resolveContact(job, rand) {
  if (job.contact?.name) {
    return {
      type: "job_poster",
      name: job.contact.name,
      designation: job.contact.job_title || "Hiring Manager",
      email: job.contact.email ?? null,
      phone: job.contact.phone ?? null,
      linkedin_url: job.contact.linkedin_url ?? null
    };
  }
  if (rand() < 0.7) {
    const firstName = pick(SAMPLE_FIRST_NAMES, rand);
    const lastName = pick(SAMPLE_LAST_NAMES, rand);
    const domain = job.company?.company_domain ?? "company.com";
    return {
      type: "hr_contact",
      name: `${firstName} ${lastName}`,
      designation: "Talent Acquisition Specialist",
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: null,
      linkedin_url: `https://linkedin.com/in/${slugify(firstName + "-" + lastName)}`
    };
  }
  return {
    type: "company_level",
    name: null,
    designation: null,
    email: null,
    phone: null,
    linkedin_url: null
  };
}

/** POST /jobs/{id}/create-lead — triggers the Apollo cascade and creates the
 * lead. Response shape matches the integration contract exactly:
 * { lead_id, contact: { type, name, designation, email, phone, linkedin_url } } */
export async function createLeadFromJob(jobId) {
  if (USE_MOCK) {
    const job = jobsStore.find(j => j.id === jobId);
    if (!job) throw new Error("Job not found");
    const existing = leadsStore.find(l => l.job_id === jobId);
    if (existing) return delay({
      lead_id: existing.id,
      contact: existing.contact
    });
    const rand = seededRandom(jobId);
    const contact = resolveContact(job, rand);
    leadSeq += 1;
    const now = new Date().toISOString();
    const lead = {
      id: `lead_${leadSeq}`,
      campaign_id: job.campaign_id,
      job_id: job.id,
      job,
      contact: {
        ...contact,
        // job_title kept as an alias of designation for the legacy Leads
        // tab/table, which reads contact.job_title.
        job_title: contact.designation
      },
      company: job.company,
      lead_type: contact.type,
      status: "new",
      source: "Campaign",
      created_at: now,
      updated_at: now
    };
    leadsStore = [lead, ...leadsStore];
    job.moved_to_lead = true;
    job.lead_id = lead.id;
    return delay({
      lead_id: lead.id,
      contact
    }, 800);
  }
  return request(`/jobs/${jobId}/create-lead`, {
    method: "POST"
  });
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function getCampaignLeads(campaignId) {
  if (USE_MOCK) return delay(leadsStore.filter(l => l.campaign_id === campaignId));
  return request(`/campaigns/${campaignId}/leads`);
}
export async function getLeads() {
  if (USE_MOCK) return delay([...leadsStore]);
  // TODO: replace with GET /leads
  return request("/leads");
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

function scoreEmployeeAgainstJob(employee, job) {
  if (!job || employee.skills.length === 0) return 0;
  const text = `${job.job_title} ${job.job_description ?? job.job_summary ?? ""}`.toLowerCase();
  const hits = employee.skills.filter(skill => text.includes(skill.toLowerCase())).length;
  return hits / employee.skills.length;
}

/** POST /leads/{id}/match-employees -> [{ employee_id, match_score, reasoning }]
 * match_score is a 0-1 float per the contract. The full `employee` object is
 * also included for the internal review UI (name/skills), which the contract
 * explicitly allows since this response never reaches outreach copy. */
export async function matchEmployeesForLead(leadId) {
  if (USE_MOCK) {
    const lead = leadsStore.find(l => l.id === leadId);
    if (!lead) throw new Error("Lead not found");
    matchResultsStore = matchResultsStore.filter(m => m.lead_id !== leadId);
    const ranked = employeesStore.map(employee => ({
      employee,
      score: scoreEmployeeAgainstJob(employee, lead.job)
    })).sort((a, b) => b.score - a.score).slice(0, 5);
    const results = ranked.map(({
      employee,
      score
    }) => {
      matchSeq += 1;
      return {
        id: `match_${matchSeq}`,
        lead_id: leadId,
        employee_id: employee.id,
        employee,
        match_score: Math.round(score * 100) / 100,
        reasoning: score > 0 ? `${employee.name}'s skills (${employee.skills.join(", ")}) overlap with the ${lead.job?.job_title ?? "role"} requirements.` : `${employee.name} has limited overlap with this role's listed requirements.`,
        confirmed: false
      };
    });
    matchResultsStore = [...matchResultsStore, ...results];
    return delay(results, 900);
  }
  return request(`/leads/${leadId}/match-employees`, {
    method: "POST"
  });
}
export async function getLeadMatches(leadId) {
  if (USE_MOCK) return delay(matchResultsStore.filter(m => m.lead_id === leadId));
  return request(`/leads/${leadId}/matches`);
}

/** POST /leads/{id}/confirm-employee — not specified in the integration
 * contract; { employee_id } in, echoes it back out. */
export async function confirmEmployeeForLead(leadId, employeeId) {
  if (USE_MOCK) {
    matchResultsStore = matchResultsStore.map(m => m.lead_id === leadId ? {
      ...m,
      confirmed: m.employee_id === employeeId
    } : m);
    return delay({
      employee_id: employeeId
    });
  }
  return request(`/leads/${leadId}/confirm-employee`, {
    method: "POST",
    body: JSON.stringify({
      employee_id: employeeId
    })
  });
}

// ---------------------------------------------------------------------------
// Email generation + send
// ---------------------------------------------------------------------------

/** POST /leads/{id}/generate-email -> { subject, body }. Uses only
 * generalized skill tags from the confirmed employee match — no name or PII
 * ever enters the copy. */
export async function generateEmailForLead(leadId) {
  if (USE_MOCK) {
    const lead = leadsStore.find(l => l.id === leadId);
    if (!lead) throw new Error("Lead not found");
    const confirmedMatch = matchResultsStore.find(m => m.lead_id === leadId && m.confirmed) ?? matchResultsStore.find(m => m.lead_id === leadId);
    const skillTags = confirmedMatch?.employee.skills ?? [];
    const companyName = lead.company?.company_name ?? lead.job?.company_name ?? "your company";
    const jobTitle = lead.job?.job_title ?? "this role";
    const firstName = lead.contact?.name ? lead.contact.name.split(" ")[0] : "there";
    const subject = `Candidates ready for your ${jobTitle} opening at ${companyName}`;
    const body = `Hi ${firstName},\n\nWe noticed ${companyName} is hiring for ${jobTitle}. We have a candidate ` + `available with strong, hands-on experience in ${skillTags.join(", ") || "the relevant skill areas for this role"}.\n\n` + `Happy to set up a quick call this week if you'd like to learn more.\n\nBest regards`;
    let email = emailsStore.find(e => e.lead_id === leadId && e.status === "draft");
    if (!email) {
      emailSeq += 1;
      email = {
        id: `email_${emailSeq}`,
        campaign_id: lead.campaign_id,
        lead_id: leadId,
        lead_name: lead.contact?.name || companyName,
        from_email: "outreach@winfomihirex.com",
        to_email: lead.contact?.email || "",
        subject,
        body,
        status: "draft",
        created_at: new Date().toISOString()
      };
      emailsStore = [email, ...emailsStore];
    } else {
      email.subject = subject;
      email.body = body;
    }
    return delay({
      subject: email.subject,
      body: email.body
    }, 700);
  }
  return request(`/leads/${leadId}/generate-email`, {
    method: "POST"
  });
}
export async function updateLeadEmail(leadId, values) {
  if (USE_MOCK) {
    const email = emailsStore.find(e => e.lead_id === leadId && e.status === "draft");
    if (!email) throw new Error("No draft email found for this lead.");
    Object.assign(email, values);
    return delay({
      ...email
    });
  }
  return request(`/leads/${leadId}/email`, {
    method: "PATCH",
    body: JSON.stringify(values)
  });
}

/** POST /leads/{id}/send-email — sends the lead's current draft via Resend.
 * Not named in the integration contract (a gap in the plan); filled in here
 * as the natural counterpart to emails.py / the frontend's send action. */
export async function sendLeadEmail(leadId) {
  if (USE_MOCK) {
    const email = emailsStore.find(e => e.lead_id === leadId && e.status === "draft");
    if (!email) throw new Error("No draft email found for this lead. Generate one first.");
    if (!email.to_email || !email.subject || !email.body) {
      email.status = "failed";
      return delay({
        ...email
      });
    }
    email.status = "sent";
    email.sent_at = new Date().toISOString();
    const lead = leadsStore.find(l => l.id === leadId);
    if (lead) lead.status = "converted";
    return delay({
      ...email
    }, 800);
  }
  return request(`/leads/${leadId}/send-email`, {
    method: "POST"
  });
}
export async function getCampaignEmails(campaignId) {
  if (USE_MOCK) return delay(emailsStore.filter(e => e.campaign_id === campaignId));
  return request(`/campaigns/${campaignId}/emails`);
}
export async function getLeadEmail(leadId) {
  if (USE_MOCK) return delay(emailsStore.find(e => e.lead_id === leadId));
  return request(`/leads/${leadId}/email`);
}

// ---------------------------------------------------------------------------
// Emails (Email tab, global)
// ---------------------------------------------------------------------------

export async function getEmails() {
  if (USE_MOCK) return delay([...emailsStore].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  return request("/emails");
}
export async function getEmail(emailId) {
  if (USE_MOCK) return delay(emailsStore.find(e => e.id === emailId));
  return request(`/emails/${emailId}`);
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export async function getCompanies() {
  if (USE_MOCK) return delay(mockCompanies);
  // TODO: replace with GET /companies
  return request("/companies");
}
export async function getCompany(companyId) {
  if (USE_MOCK) return delay(mockCompanies.find(c => c.id === companyId));
  // TODO: replace with GET /companies/{companyId}
  return request(`/companies/${companyId}`);
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export async function getContacts() {
  if (USE_MOCK) return delay(mockContacts);
  // TODO: replace with GET /contacts
  return request("/contacts");
}
export async function getContact(contactId) {
  if (USE_MOCK) return delay(mockContacts.find(c => c.id === contactId));
  // TODO: replace with GET /contacts/{contactId}
  return request(`/contacts/${contactId}`);
}

// ---------------------------------------------------------------------------
// Employees (bench data used for matching)
// ---------------------------------------------------------------------------

function toEmployee(id, values) {
  return {
    id,
    name: values.name,
    role_title: values.role_title,
    skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
    experience_years: Number(values.experience_years) || 0,
    availability: values.availability,
    email: values.email || undefined,
    summary: values.summary || undefined
  };
}
export async function getEmployees() {
  if (USE_MOCK) return delay([...employeesStore]);
  // TODO: replace with GET /employees
  return request("/employees");
}
export async function createEmployee(values) {
  if (USE_MOCK) {
    employeeSeq += 1;
    const employee = toEmployee(`emp_${employeeSeq}`, values);
    employeesStore = [employee, ...employeesStore];
    return delay(employee);
  }
  // TODO: replace with POST /employees
  return request("/employees", {
    method: "POST",
    body: JSON.stringify(values)
  });
}
export async function updateEmployee(employeeId, values) {
  if (USE_MOCK) {
    const existing = employeesStore.find(e => e.id === employeeId);
    if (!existing) throw new Error("Employee not found");
    const updated = toEmployee(employeeId, values);
    employeesStore = employeesStore.map(e => e.id === employeeId ? updated : e);
    return delay(updated);
  }
  // TODO: replace with PATCH /employees/{employeeId}
  return request(`/employees/${employeeId}`, {
    method: "PATCH",
    body: JSON.stringify(values)
  });
}
export async function deleteEmployee(employeeId) {
  if (USE_MOCK) {
    employeesStore = employeesStore.filter(e => e.id !== employeeId);
    return delay(undefined);
  }
  // TODO: replace with DELETE /employees/{employeeId}
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
// Dashboard
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  if (USE_MOCK) {
    const qualified = jobsStore.filter(j => j.qualified).length;
    return delay({
      total_jobs: jobsStore.length,
      qualified_jobs: qualified,
      total_leads: leadsStore.length,
      contacts_found: mockContacts.length,
      jobs_discovered: jobsStore.length,
      jobs_rejected: jobsStore.length - qualified,
      qualification_rate: jobsStore.length ? Math.round(qualified / jobsStore.length * 100) : 0,
      trend: {
        total_jobs: 12,
        qualified_jobs: 8,
        total_leads: 24,
        contacts_found: 15
      }
    });
  }
  // TODO: replace with GET /dashboard/stats
  return request("/dashboard/stats");
}
export async function getRecentActivity() {
  if (USE_MOCK) {
    return delay([{
      id: "act_1",
      label: "New lead created",
      description: "Jane Smith at Acme AI",
      timestamp: "2026-08-16T05:30:00Z"
    }, {
      id: "act_2",
      label: "Job qualified",
      description: "Full Stack Engineer at Solace HealthTech",
      timestamp: "2026-08-16T02:30:00Z"
    }, {
      id: "act_3",
      label: "Apollo enrichment completed",
      description: "Daniel Reyes enriched with email + phone",
      timestamp: "2026-08-15T09:00:00Z"
    }, {
      id: "act_4",
      label: "Lead status changed",
      description: "Priya Chandrasekaran moved to Qualified",
      timestamp: "2026-08-15T13:00:00Z"
    }, {
      id: "act_5",
      label: "Search completed",
      description: "538 jobs scanned, 7 qualified",
      timestamp: "2026-08-14T09:00:00Z"
    }]);
  }
  // TODO: replace with GET /dashboard/activity
  return request("/dashboard/activity");
}
