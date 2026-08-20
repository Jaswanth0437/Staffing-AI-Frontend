"use client";

import {
  getCampaign,
  getCampaignEmails,
  getCampaignJobs,
  getCampaignLeads,
  getCampaignMatching,
  getCampaigns,
} from "@/lib/api";
import { useAsyncData } from "./useAsyncData";

export function useCampaigns() {
  return useAsyncData(() => getCampaigns(), []);
}

export function useCampaign(campaignId: string) {
  return useAsyncData(() => getCampaign(campaignId), [campaignId]);
}

export function useCampaignJobs(campaignId: string, tab?: "qualified" | "rejected") {
  return useAsyncData(() => getCampaignJobs(campaignId, tab), [campaignId, tab]);
}

export function useCampaignLeads(campaignId: string) {
  return useAsyncData(() => getCampaignLeads(campaignId), [campaignId]);
}

export function useCampaignMatching(campaignId: string) {
  return useAsyncData(() => getCampaignMatching(campaignId), [campaignId]);
}

export function useCampaignEmails(campaignId: string) {
  return useAsyncData(() => getCampaignEmails(campaignId), [campaignId]);
}
