export const APP_NAME = "StaffingX";
export const NAV_ITEMS = [{
  label: "Dashboard",
  href: "/dashboard",
  icon: "LayoutDashboard"
}, {
  label: "Campaigns",
  href: "/campaigns",
  icon: "Megaphone"
}, {
  label: "Leads",
  href: "/leads",
  icon: "Users"
}, {
  label: "Resources",
  href: "/employees",
  icon: "IdCard"
}, {
  label: "Emails",
  href: "/emails",
  icon: "Mail"
}, {
  label: "Companies",
  href: "/companies",
  icon: "Building2"
}];
export const SETTINGS_NAV_ITEMS = [{
  label: "General",
  href: "/settings"
}, {
  label: "Integrations",
  href: "/settings/integrations"
}, {
  label: "Scraping",
  href: "/settings/scraping"
}];
export const TIME_RANGE_OPTIONS = ["Past 24 hours", "Past week", "Past month", "Any time"];
export const JOB_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];
export const EXPERIENCE_LEVEL_OPTIONS = ["Internship", "Entry level", "Associate", "Mid-Senior level", "Director", "Executive"];
export const REMOTE_OPTIONS = ["On-site", "Remote", "Hybrid"];
export const COUNTRY_OPTIONS = [{
  label: "United Kingdom",
  value: "GB"
}, {
  label: "United States",
  value: "US"
}, {
  label: "Germany",
  value: "DE"
}, {
  label: "France",
  value: "FR"
}, {
  label: "Canada",
  value: "CA"
}, {
  label: "India",
  value: "IN"
}];
export const LEAD_STATUS_OPTIONS = ["new", "contacted", "qualified", "converted", "rejected"];
export const LEAD_TYPE_OPTIONS = ["job_poster", "hr_recruiter", "company_only"];
export const LEAD_SOURCE_OPTIONS = ["Apollo", "Manual", "Import"];
export const EMPLOYEE_AVAILABILITY_OPTIONS = ["available", "on-bench", "deployed"];
export const CONTACT_TIER_LABELS = {
  job_poster: "Job Poster",
  hr_contact: "HR Contact",
  employee_contact: "Employee Contact",
  company_level: "Company-Level"
};

// These three lists must match the exact tokens backend/config.py's
// EMPLOYMENT_TYPE_KEYWORDS / WORK_MODE_KEYWORDS and apify_client.py's
// posting_timeframe parsing expect — not display-cased strings.
export const EMPLOYMENT_TYPE_OPTIONS = [{
  label: "Full-time",
  value: "full_time"
}, {
  label: "Part-time",
  value: "part_time"
}, {
  label: "Contract",
  value: "contract"
}, {
  label: "Internship",
  value: "internship"
}, {
  label: "Temporary",
  value: "temporary"
}];
export const WORK_MODE_OPTIONS = [{
  label: "Remote",
  value: "remote"
}, {
  label: "Hybrid",
  value: "hybrid"
}, {
  label: "On-site",
  value: "onsite"
}];
export const POSTING_TIMEFRAME_OPTIONS = [{
  label: "Any time",
  value: "any"
}, {
  label: "Last 24 hours",
  value: "last_24_hours"
}, {
  label: "Last 7 days",
  value: "last_7_days"
}, {
  label: "Last 30 days",
  value: "last_30_days"
}];
export const JOB_SOURCE_OPTIONS = [{
  label: "LinkedIn",
  value: "linkedin"
}, {
  label: "Dice",
  value: "dice"
}, {
  label: "Both",
  value: "both"
}];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend";
