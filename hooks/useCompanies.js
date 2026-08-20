"use client";

import { getCompanies, getCompany } from "@/lib/api";
import { useAsyncData } from "./useAsyncData";
export function useCompanies() {
  return useAsyncData(() => getCompanies(), []);
}
export function useCompany(companyId) {
  return useAsyncData(() => getCompany(companyId), [companyId]);
}
