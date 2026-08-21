"use client";

import { getCampaign, getCampaignJobs, getCampaigns } from "@/lib/api";
import { useAsyncData } from "./useAsyncData";
export function useCampaigns() {
  return useAsyncData(() => getCampaigns(), []);
}
export function useCampaign(campaignId) {
  return useAsyncData(() => getCampaign(campaignId), [campaignId]);
}
export function useCampaignJobs(campaignId, tab) {
  return useAsyncData(() => getCampaignJobs(campaignId, tab), [campaignId, tab]);
}
