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
export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}
export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
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
