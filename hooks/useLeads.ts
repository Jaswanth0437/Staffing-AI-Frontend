"use client";

import { getLead, getLeads } from "@/lib/api";
import { useAsyncData } from "./useAsyncData";

export function useLeads() {
  return useAsyncData(() => getLeads(), []);
}

export function useLead(leadId: string) {
  return useAsyncData(() => getLead(leadId), [leadId]);
}
