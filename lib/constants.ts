export const APP_NAME = "LeadFlow";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Search", href: "/search", icon: "Search" },
  { label: "Campaigns", href: "/campaigns", icon: "Megaphone" },
  { label: "Leads", href: "/leads", icon: "Users" },
  { label: "Employees", href: "/employees", icon: "IdCard" },
  { label: "Emails", href: "/emails", icon: "Mail" },
  { label: "Companies", href: "/companies", icon: "Building2" },
  { label: "Contacts", href: "/contacts", icon: "Contact" },
] as const;

export const SETTINGS_NAV_ITEMS = [
  { label: "General", href: "/settings" },
  { label: "Integrations", href: "/settings/integrations" },
  { label: "Scraping", href: "/settings/scraping" },
] as const;

export const TIME_RANGE_OPTIONS = [
  "Past 24 hours",
  "Past week",
  "Past month",
  "Any time",
];

export const JOB_TYPE_OPTIONS = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
];

export const EXPERIENCE_LEVEL_OPTIONS = [
  "Internship",
  "Entry level",
  "Associate",
  "Mid-Senior level",
  "Director",
  "Executive",
];

export const REMOTE_OPTIONS = ["On-site", "Remote", "Hybrid"];

export const COUNTRY_OPTIONS = [
  { label: "United Kingdom", value: "GB" },
  { label: "United States", value: "US" },
  { label: "Germany", value: "DE" },
  { label: "France", value: "FR" },
  { label: "Canada", value: "CA" },
  { label: "India", value: "IN" },
];

export const LEAD_STATUS_OPTIONS = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "rejected",
] as const;

export const LEAD_TYPE_OPTIONS = [
  "job_poster",
  "hr_recruiter",
  "company_only",
] as const;

export const LEAD_SOURCE_OPTIONS = ["Apollo", "Manual", "Import"];

export const EMPLOYEE_AVAILABILITY_OPTIONS = ["available", "on-bench", "deployed"] as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
