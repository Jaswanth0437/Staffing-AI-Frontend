"use client";

import { getCampaign, getCampaignEmails, getCampaignJobs, getCampaignLeads, getCampaignMatching, getCampaigns } from "@/lib/api";
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
export function useCampaignLeads(campaignId) {
  return useAsyncData(() => getCampaignLeads(campaignId), [campaignId]);
}
export function useCampaignMatching(campaignId) {
  return useAsyncData(() => getCampaignMatching(campaignId), [campaignId]);
}
export function useCampaignEmails(campaignId) {
  return useAsyncData(() => getCampaignEmails(campaignId), [campaignId]);
}
