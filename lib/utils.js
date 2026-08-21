import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function formatNumber(value) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}
export function formatApplicants(value) {
  if (value === undefined || value === null) return "—";
  if (value >= 100) return "100+";
  return `${value}`;
}
export function formatEmployeeCount(value) {
  if (value === undefined || value === null) return "—";
  return `${formatNumber(value)} employees`;
}
export function formatRelativeTime(value) {
  if (!value) return "—";
  return value;
}
// The backend stamps timestamps with Python's datetime.utcnow() and returns
// them without a "Z" suffix or offset (e.g. "2026-08-21T05:13:03.060823").
// A timezone-less ISO string is parsed by `Date()` as LOCAL time, not UTC —
// so without this fix, a UTC value gets displayed unchanged and silently
// reads as ~5.5 hours behind real IST. Treat any offset-less string as UTC
// before parsing, then always render in Asia/Kolkata regardless of the
// viewer's own OS/browser timezone.
function parseBackendTimestamp(value) {
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}
export function formatDate(value) {
  if (!value) return "—";
  const date = parseBackendTimestamp(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata"
  }).format(date);
}
export function formatDateTime(value) {
  if (!value) return "—";
  const date = parseBackendTimestamp(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  }).format(date);
}
export function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
export function orNotAvailable(value) {
  return value && value.trim().length > 0 ? value : "Not available";
}
export function titleCase(value) {
  return value.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
// For full free-text sentences (e.g. activity log messages like "generated
// email (id=7)" or "contact resolved via apollo") — capitalizes the first
// letter of every whitespace-separated word without touching the rest, so
// existing casing inside a word (acronyms, ids, parenthetical tags like
// "(employee_contact)") is left alone.
export function titleCaseSentence(value) {
  if (!value) return value;
  return value.replace(/\S+/g, word => word.charAt(0).toUpperCase() + word.slice(1));
}
